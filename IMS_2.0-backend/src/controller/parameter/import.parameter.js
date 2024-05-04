const { unlink } = require("fs");
const XLSX = require("xlsx");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const uploadExcel = require("../../utils/multer/upload.excel");
const runMiddleware = require("../../utils/helpers/multer.middleware");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const validateParameterField = require("../../utils/helpers/validate.imported.parameter.data");
const parameterServices = require("../../service/parameter.service");
const categoryServices = require("../../service/category.service");



// API for importing parameter data from Excel
const importParameter = async (request, response) => {
    try {
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("parameter"));
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
        const expectedFormat = ["Category Name", "Parameter Name"];
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
        const existParameter = [];
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
            const name = obj['Category Name'];
            const parameter = obj['Parameter Name'].split(',')?.map((ele) => ele.trim());
            if (!(uniqueObjects[name])) {
                uniqueObjects[name] = true;

                acc.push({
                    'Category Name': name,
                    'Parameter Name': [...new Set(parameter)]
                });
            }
            return acc;
        }, []);


        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];

            //validate fields
            if (validateParameterField(obj["Category Name"], obj["Parameter Name"])) {
                //check parameter already exist or not
                let isParameterExist = await parameterServices.getCategoryParameterByName(obj["Category Name"]);
                if (isParameterExist) {
                    existParameter.push(obj["Parameter Name"]);
                } else {
                    const isCategoryExist = await categoryServices.getCategoryByName(obj["Category Name"]);
                    if (isCategoryExist) {
                        formattedTransactions.push({
                            "parameter": obj["Parameter Name"],
                            "categoryId": isCategoryExist?._id?.toString(),
                            "name": isCategoryExist?.name
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

        //check parameter is already exist
        if (((existParameter.length) === data.length) || (data.length - notInsertedRecord.length) === (existParameter.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This parameter already exists."
            });
            return;
        };

        //check is there parameter to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload parameter. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await parameterServices.addBulkilyParameter(formattedTransactions);
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
                message: "Failed to Import parameter"
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

module.exports = importParameter;