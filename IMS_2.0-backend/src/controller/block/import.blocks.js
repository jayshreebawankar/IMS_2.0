const { unlink } = require("fs");
const XLSX = require("xlsx");
const runMiddleware = require("../../utils/helpers/multer.middleware");
const uploadExcel = require("../../utils/multer/upload.excel");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const validateBlockFields = require("../../utils/helpers/validate.imported.block.data");
const blockServices = require("../../service/block.services");
const rackServices = require("../../service/rack.services");
const locationServices = require("../../service/location.service");


// API for importing RTO data from Excel
const importBrand = async (request, response) => {
    try {
        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("block"));
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
        const expectedFormat = ["Location", "Block Number", "Want Add Rack", "Rack Number"];
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
        const existBlock = [];
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
            const block = obj["Block Number"];
            if (!uniqueObjects[block]) {
                uniqueObjects[block] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];
            //validate fields
            if (validateBlockFields(obj["Location"], obj["Block Number"], obj["Want Add Rack"])) {
                //check block already exist or not
                let isBlockExist = await blockServices.getBlockByBlockNo(obj["Block Number"]);
                if (isBlockExist) {
                    existBlock.push(obj["Block Number"]);
                } else {
                    let rackNo = [];
                    const rack = [];
                    if (obj["Want Add Rack"].toLowerCase() === "yes") {
                        // Split the "Rack Number" string into an array of tab names and remove false value i.e empty string
                        rackNo = obj["Rack Number"] ? obj["Rack Number"].split(',').map(ele => ele.trim()) : []; // Split rack numbers and trim spaces
                        const arrLength = rackNo?.length
                        for (let i = 0; i < arrLength; i++) {
                            const element = rackNo[i];
                            const result = await rackServices.getRackByRackNo(element);
                            if (!result) {
                                existBlock.push(obj["Block Number"]);
                                break;
                            } else {
                                rack.push(
                                    result?._id?.toString()
                                )
                            }
                        }
                    }
                    //get location by name
                    const location = await locationServices.getLocationByName(obj["Location"].toLowerCase().trim());
                    if (location) {
                        formattedTransactions.push({
                            "locationId": location?._id?.toString(),
                            "location": location?.name,
                            "blockNo": obj["Block Number"],
                            "isRackAdded": obj["Want Add Rack"].toLowerCase() === "yes" ? true : false,
                            "rackId": rack,
                            "rackNo": rackNo
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

        //check brand is already exist
        if (((existBlock.length) === data.length) || (data.length - notInsertedRecord.length) === (existBlock.length)) {
            response.status(200).json({
                status: "FAILED",
                message: "This block already exists."
            });
            return;
        };

        //check is there block to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload block. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await blockServices.addBulkilyBlock(formattedTransactions);
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
                message: "Failed to Import block"
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