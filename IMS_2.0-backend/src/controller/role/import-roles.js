const { unlink } = require("fs");
const XLSX = require("xlsx");
const uploadExcel = require("../../utils/multer/upload.excel");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const validateRoleData = require("../../utils/helpers/validate.imported.role.data");
const roleServices = require("../../service/role.service");
const verifyTab = require("../../utils/helpers/verify.tab");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");

//multer helper function
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error || result?.code) {
                return reject(result)
            }
            return resolve(result)
        });
    });
};

// API for importing RTO data from Excel
const importRoles = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        const isUserHasAccess = await checkTabAccess(tabAccess, "Role Management");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            })
            return;
        };
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("roles"));
        if (file) {
            response.status(200).json({
                status: "FAILED",
                message: file?.code,
            });
            return;
        };

        // Extract file path
        const filePath = request?.file?.path?.toString();

        //Read the uploaded file using XLSX
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        //Check if the format matches the expected format.
        const expectedFormat = ["Role", "Tab Access"];
        const actualFormat = jsonData[0];

        if (!await checkExcelFormat(expectedFormat, actualFormat)) {
            return response.status(200).json({
                status: "FAILED",
                message: "The Excel file doesn't match the expected format."
            });
        };

        const formattedTransactions = [];
        const excelData = jsonData.filter(row => Object.values(row).some(cell => cell !== null && cell !== ''));//remove empty space
        let sampleData = [];
        const notInsertedRecord = [];
        const existRole = [];
        const keys = excelData[0];
        const keyLength = keys?.length;

        //check excel sheet is empty or not
        if ([0, 1].includes(excelData?.length)) {
            return response.status(200).json({
                status: "FAILED",
                message: "The Excel sheet has no data."
            });
        };

        for (let i = 1; i < excelData.length; i++) {
            let row = excelData[i], obj = {};
            for (let j = 0; j < keyLength; j++) {
                obj[keys[j]] = row[j];
            }
            sampleData.push(obj);
        }

        //
        const uniqueObjects = {};
        const data = sampleData.reduce((acc, obj) => {
            const role = obj['Role'];
            if (!uniqueObjects[role]) {
                uniqueObjects[role] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];

            // Split the "Tab Access" string into an array of tab names and remove false value i.e empty string
            const tabAccessArray = obj["Tab Access"].split(/\s*,\s*/).filter(Boolean);

            // Validate fields
            if (validateRoleData(obj["Role"], tabAccessArray)) {
                // Check if role already exists
                let isRoleExist = await roleServices.getRoleByName(obj["Role"].toLowerCase());
                if (isRoleExist) {
                    existRole.push({ "role": obj["Role"] });
                } else {
                    // Use verifyTab for each tab in tabAccessArray
                    const validTabs = verifyTab(tabAccessArray);

                    // Push each combination of role and valid tab into formattedTransactions
                    if (validTabs) {
                        formattedTransactions.push({
                            "role": obj["Role"].toLowerCase(),
                            "tab": validTabs // Trim to remove extra spaces
                        });
                    } else {
                        notInsertedRecord.push(i + 2);
                    }
                }
            } else {
                notInsertedRecord.push(i + 2);
            }
        }


        //Delete the uploaded file
        await unlink(filePath, (err) => {
            if (err) throw err
        });

        //check role is already exist
        if (((existRole.length) === data.length) || (data.length - notInsertedRecord.length) === (existRole.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This Role already exists."
            });
            return;
        };

        //check is there role to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload role. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await roleServices.addBulkilyRole(formattedTransactions);
        if (result?.length > 0) {
            if (notInsertedRecord.length === 0) {
                response.status(200).json({
                    status: "SUCCESS",
                    message: "Data Imported Successfully"
                })
            } else {
                response.status(200).json({
                    status: "FAILED",
                    message: `The data in row ${notInsertedRecord?.toString()} was not inserted from the Excel file. Please check the Excel file.`
                });
                return;
            }
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to Import Role"
            });
            return;
        };
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = importRoles;