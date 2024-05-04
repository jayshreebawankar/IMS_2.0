const blockServices = require("../../service/block.services");
const brandServices = require("../../service/brand.services");
const categoryServices = require("../../service/category.service");
const inventoryServices = require("../../service/inventory.service");
const locationServices = require("../../service/location.service");
const parameterServices = require("../../service/parameter.service");
const rackServices = require("../../service/rack.services");
const { stockInValidation } = require("../../utils/validation/inventory.validation");


const stockIn = async (request, response) => {
    try {
        const id = request.id;

        //extract data from request body
        const { locationId, blockId, rackId, categoryId, parameterId, brandId, conditionType, status, itemCode, modelName, serialNo, quantity, parameter, partitionName } = request.body;

        //check validation
        const validationResult = await stockInValidation.validate({ locationId, blockId, rackId, categoryId, parameterId, brandId, conditionType, status, itemCode, modelName, serialNo, quantity, parameter, partitionName }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check location exist or not
        const isLocationExist = await locationServices.getLocationById(locationId)
        if (!isLocationExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Location not available",
            });
            return;
        }

        //check brand exist or not
        const isBrandExist = await brandServices.getBrandById(brandId)
        if (!isBrandExist) {
            response.status(200).json({
                status: "FAILED",
                message: "brand not exist",
            });
            return;
        }


        //check category exist or not
        const isCategoryExist = await categoryServices.getCategoryById(categoryId);
        if (!isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "category not available",
            });
            return;
        }


        //check block exist or not
        const isBlockExist = await blockServices.getBlockById(blockId);
        if (!isBlockExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Block not available",
            });
            return;
        }

        //check rack exist or not
        let isRackExist
        if (rackId) {
            isRackExist = await rackServices.getRackById(rackId);
            if (!isRackExist) {
                response.status(200).json({
                    status: "FAILED",
                    message: "Rack not available",
                });
                return;
            }
        }

        //check Parameter exist or not
        const isParameterExist = await parameterServices.getParameterById(parameterId);
        if (!isParameterExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Parameter not available",
            });
            return;
        };

        //check selected itemCode is already exist or not
        const isItemCodeStockExist = await inventoryServices.getItemCodeWiseStockData(itemCode?.toString());
        if (isItemCodeStockExist) {
            return response.status(200).json({
                status: "FAILED",
                message: `${itemCode} stock already exist.`
            })
        };

        const dataToInsert = {
            locationId,
            location: isLocationExist.name,
            blockId,
            block: isBlockExist.blockNo,
            rackId: rackId ? rackId : null,
            rack: rackId ? isRackExist.rackNo : null,
            partitionName: partitionName ? partitionName : null,
            categoryId,
            category: isCategoryExist.name,
            brandId,
            brand: isBrandExist.name,
            parameterId,
            modelName,
            conditionType,
            status,
            itemCode,
            serialNo,
            quantity,
            parameter,
            isActive: true,
            logs: [],
            addedBy: id,
            assignedTo: null,
            stockStatus: "new",
            amount: null
        }

        //insert data into db & send response to client
        const result = await inventoryServices.addStock(dataToInsert);
        if (result._id) {
            if (rackId) {
                //update rack partition status i.e isFilled === true
                await rackServices.updateRackPartitionStatus(rackId, partitionName, true)
            }

            response.status(200).json({
                status: "SUCCESS",
                message: "stock added successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to add stock, Please try again!",
            });
            return;
        }
    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};
module.exports = stockIn;


//stockIn stockout assign accept