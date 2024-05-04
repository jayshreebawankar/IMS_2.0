const runMiddleware = require("../../utils/helpers/multer.middleware");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const uploadExcel = require("../../utils/multer/upload.excel");
const { unlink } = require("fs");
const XLSX = require("xlsx");
const userServices = require("../../service/user.service");
const roleServices = require("../../service/role.service");
const validateUserFields = require("../../utils/helpers/validate.imported.user.data");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const locationServices = require("../../service/location.service");


// API for importing Users data from Excel
const importUsers = async (request, response) => {
    try {
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("users"));
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
        const expectedFormat = ["Role Type", "Name", "Email", "Contact No", "Password", "Location"];
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
        const existUser = [];
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
            const mobile = obj['Contact No'];
            if (!uniqueObjects[mobile]) {
                uniqueObjects[mobile] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];
            //validate fields
            if (validateUserFields(obj["Role Type"], obj["Name"], obj["Email"], obj["Contact No"], obj["Password"], obj["Location"])) {
                //check user already exist or not
                let isUserExist = await userServices.getUserByMobile(obj["Contact No"]);
                if (isUserExist) {
                    existUser.push(obj["Contact No"]);
                } else {
                    const isRoleExist = await roleServices.getRoleByName(obj["Role Type"]);
                    const isLocationExist = await locationServices.getLocationByName(obj["Location"])
                    let userId;
                    //get all users for userId
                    const users = await userServices.getLatestCreatedRecord();
                    //generate user id
                    if (users.length > 0) {
                        const lastUserUserId = (Number(users[0].userId.substring(3)) + 1)
                        userId = `IMS${lastUserUserId}`
                    } else {
                        userId = "IMS1000"
                    }
                    if (isRoleExist && isLocationExist) {
                        formattedTransactions.push({
                            "roleId": isRoleExist?._id?.toString(),
                            "role": isRoleExist?.role,
                            "userId": userId,
                            "name": obj["Name"],
                            "email": obj["Email"],
                            "mobile": obj["Contact No"].toString(),
                            "password": obj["Password"],
                            "locationId": isLocationExist?._id?.toString(),
                            "location": isLocationExist?.name,
                            "isActive": true
                        });
                    } else {
                        notInsertedRecord.push(i + 2);
                    }
                };
            } else {
                notInsertedRecord.push(i + 2);
            };
        };


        //Delete the uploaded file
        await unlink(filePath, (err) => {
            if (err) throw err
        });

        //check role is already exist
        if (((existUser.length) === data.length) || (data.length - notInsertedRecord.length) === (existUser.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This User already exists."
            });
            return;
        };

        //check is there role to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload user. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await userServices.addBulkilyUser(formattedTransactions);
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
                message: "Failed to Import user"
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

module.exports = importUsers;