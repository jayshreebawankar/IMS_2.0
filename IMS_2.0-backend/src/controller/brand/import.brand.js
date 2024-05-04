const { unlink } = require("fs");
const XLSX = require("xlsx");
const runMiddleware = require("../../utils/helpers/multer.middleware");
const uploadExcel = require("../../utils/multer/upload.excel");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const validateCategoryField = require("../../utils/helpers/validate.imported.category.data");
const brandServices = require("../../service/brand.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");


// API for importing RTO data from Excel
const importBrand = async (request, response) => {
    try {
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("brand"));
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
        const expectedFormat = ["Brand Name"];
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
        const existBrand = [];
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
            const brand = obj["Brand Name"];
            if (!uniqueObjects[brand]) {
                uniqueObjects[brand] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];
            //validate fields
            if (validateCategoryField(obj["Brand Name"])) {
                //check category already exist or not
                let isBrandExist = await brandServices.getBrandByName(obj["Brand Name"]);
                if (isBrandExist) {
                    existBrand.push(obj["Brand Name"]);
                } else {
                    formattedTransactions.push({
                        "name": obj["Brand Name"].toLowerCase()
                    });
                };
            } else {
                notInsertedRecord.push(i + 2);
            };
        };

        //Delete the uploaded file
        await unlink(filePath, (err) => {
            if (err) throw err
        });

        //check brand is already exist
        if (((existBrand.length) === data.length) || (data.length - notInsertedRecord.length) === (existBrand.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This brand already exists."
            });
            return;
        };

        //check is there brand to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload brand. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await brandServices.addBulkilyBrand(formattedTransactions);
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
                message: "Failed to Import brand"
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

module.exports = importBrand;