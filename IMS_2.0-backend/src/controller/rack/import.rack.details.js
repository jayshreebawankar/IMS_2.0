const { unlink } = require("fs");
const XLSX = require("xlsx");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const uploadExcel = require("../../utils/multer/upload.excel");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const runMiddleware = require("../../utils/helpers/multer.middleware");
const validateRackField = require("../../utils/helpers/validate.imported.rack.data");
const rackServices = require("../../service/rack.services");
const generateRackPartitions = require("../../utils/helpers/rack-partition-array");


// API for importing RTO data from Excel
const importRackInfo = async (request, response) => {
    try {
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("rack"));
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
        const expectedFormat = ["Rack No", "Partition"];
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
        const existRack = [];
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
            const rack = obj["Rack No"];
            if (!uniqueObjects[rack]) {
                uniqueObjects[rack] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];
            //validate fields
            if (validateRackField(obj["Rack No"], obj["Partition"])) {
                //check rack already exist or not
                let isRackExist = await rackServices.getRackByRackNo(obj["Rack No"].toString());
                if (isRackExist) {
                    existRack.push(obj["Rack No"]);
                } else {
                    const partitions = await generateRackPartitions(obj["Rack No"], obj["Partition"]);
                    formattedTransactions.push({
                        "rackNo": obj["Rack No"].toString(),
                        "partition": obj["Partition"].toString(),
                        "partitionArray": partitions,
                        "isActive": true
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

        //check category is already exist
        if (((existRack.length) === data.length) || (data.length - notInsertedRecord.length) === (existRack.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This rack already exists."
            });
            return;
        };

        //check is there category to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload rack. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await rackServices.addBulkilyRack(formattedTransactions);
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
                message: "Failed to Import rack"
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

module.exports = importRackInfo;