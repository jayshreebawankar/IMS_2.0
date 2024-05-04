const { ObjectId } = require("mongodb");
const blockServices = require("../../service/block.services");
const brandServices = require("../../service/brand.services");
const categoryServices = require("../../service/category.service");
const inventoryServices = require("../../service/inventory.service");
const locationServices = require("../../service/location.service");
const parameterServices = require("../../service/parameter.service");
const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateStockValidation } = require("../../utils/validation/inventory.validation");


const updateStockIn = async (request, response) => {
    try {
        const { id, name, tab } = request;


        //extract data from request body
        const { stockId, locationId, blockId, rackId, categoryId, parameterId, brandId, conditionType, status, itemCode, modelName, serialNo, quantity, parameter, partitionName } = request.body;

        //check validation
        const validationResult = await updateStockValidation.validate({ stockId, locationId, blockId, rackId, categoryId, parameterId, brandId, conditionType, status, itemCode, modelName, serialNo, quantity, parameter, partitionName }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check stock entry exist ot not
        const isStockExist = await inventoryServices.getStockById(stockId)
        if (!isStockExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Stock entry not available",
            });
            return;
        };

        //check material return or stock-out or not
        if (["stock out", "return"].includes(isStockExist?.stockStatus)) {
            response.status(200).json({
                status: "FAILED",
                message: `You can not update ${isStockExist?.stockStatus} material.`,
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


        const dataToUpdate = {
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
            logs: [...isStockExist.logs,
            {
                "actionDate": new Date(),
                "action": "update",
                "updatedBy": new ObjectId(id),
                "message": `stock entry updated by ${name}`
            }
            ],
        }

        //update data into db & send response to client
        const result = await inventoryServices.updateStock(stockId, dataToUpdate);
        if (result.acknowledged && result.matchedCount) {
            if (rackId) {
                if (!(isStockExist?.partitionName === partitionName)) {
                    //update rack partition status
                    const updateRackPartitionStatus = await rackServices.updateRackPartitionStatus(rackId, partitionName, true);
                };
            }
            response.status(200).json({
                status: "SUCCESS",
                message: "stock updated successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to update stock, Please try again!",
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
module.exports = updateStockIn;