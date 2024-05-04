const { ObjectId } = require("mongodb");
const blockServices = require("../../service/block.services");
const brandServices = require("../../service/brand.services");
const categoryServices = require("../../service/category.service");
const locationServices = require("../../service/location.service");
const rackServices = require("../../service/rack.services");
const checkExcelFormat = require("../../utils/helpers/check.excel.format");
const runMiddleware = require("../../utils/helpers/multer.middleware");
const validateStockField = require("../../utils/helpers/validate-imported-stock-field");
const uploadExcel = require("../../utils/multer/upload.excel");
const inventoryServices = require("../../service/inventory.service");
const parameterServices = require("../../service/parameter.service");


const importStocks = async (request, response) => {
    try {
        const id = request.id;
        //check user have access of this tab or not
        const tabAccess = request.tab
        //  const isUserHasAccess = await checkTabAccess(tabAccess, "category");
        //  if (isUserHasAccess === 0) {
        //      response.status(200).json({
        //          status: "FAILED",
        //          message: "You don't have access to this tab."
        //      })
        //      return;
        //  };

        //Upload Excel file using multer
        const file = await runMiddleware(request, response, uploadExcel.single("stock"));
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
        const expectedFormat = ["Location", "Block", "Rack No", "Category", "Parameter", "Brand", "Condition Type", "Status", "Item Code", "Model Name", "Serial No", "Quantity"];
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
        const existCategory = [];
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
        };

        const uniqueObjects = {};
        const data = sampleData.reduce((acc, obj) => {
            const category = obj["Location"];
            if (!uniqueObjects[category]) {
                uniqueObjects[category] = true;
                acc.push(obj);
            }
            return acc;
        }, []);

        //convert data into object format & save into array
        const dataLength = data?.length;
        for (let i = 0; i < dataLength; i++) {
            let obj = data[i];
            //validate fields
            if (validateStockField(obj["Location"], obj["Block"], obj["Rack No"], obj["Category"], obj["Parameter"], obj["Brand"], obj["Condition Type"], obj["Status"], obj["Item Code"], obj["Model Name"], obj["Serial No"], obj["Quantity"])) {
                let isLocationExist = await locationServices.getLocationByName((obj["Location"]));
                let isBlockExist = await blockServices.getBlockByBlockNo(obj["Block"]);
                let isRackExist = await rackServices.getRackByRackNo(obj["Rack No"]);
                let isCategoryExist = await categoryServices.getCategoryByName(obj["Category"]);
                let isBrandExist = await brandServices.getBrandByName(obj["Brand"]);
                if (isLocationExist && isBlockExist && isRackExist && isCategoryExist && isBrandExist) {
                    formattedTransactions.push({
                        "locationId": isLocationExist?._id?.toString(),
                        "location": isLocationExist?.name,
                        "blockId": isBlockExist?._id?.toString(),
                        "block": isBlockExist?.blockNo,
                        "rackId": isRackExist?._id?.toString(),
                        "rack": isRackExist?.rackNo,
                        "categoryId": isCategoryExist?._id?.toString(),
                        "category": isCategoryExist?.name,
                        "brandId": isBrandExist?._id?.toString(),
                        "brand": isBrandExist?.name,
                        "conditionType": obj["Condition Type"],
                        "status": obj["Status"],
                        "itemCode": obj["Item Code"],
                        "serialNo": obj["Serial No"],
                        "quantity": obj["Quantity"],
                        "modelName": obj["Model Name"],
                        "addedBy": new ObjectId(id),
                        "isActive": true,
                        "logs": [],
                        "assignedTo": null
                    });
                } else {
                    notInsertedRecord.push(i + 2);
                }
            }
        }

        //Delete the uploaded file
        await unlink(filePath, (err) => {
            if (err) throw err
        });


        //check is there category to add
        if (formattedTransactions.length === 0) {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to upload stock. Please check the Excel file and ensure all mandatory fields are inserted."
            });
        };

        //save data into db & send response to client
        const result = await inventoryServices.addBulkilyStocks(formattedTransactions);
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
                message: "Failed to Import stocks"
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

module.exports = importStocks;