const blockServices = require("../../service/block.services");
const locationServices = require("../../service/location.service");
const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { blockValidation } = require("../../utils/validation/block.validation");


const createBlock = async (request, response) => {
    try {
        //extract data from request body
        const { locationId, blockNo, isRackAdded, rackId } = request.body;

        //check validation
        const validationResult = await blockValidation.validate({ locationId, blockNo, isRackAdded, rackId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check block already exist 
        const isBlockExist = await blockServices.getBlockByBlockNo(blockNo)
        if (isBlockExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Block already exists with this block number."
            });
            return;
        };

        //check location exist or not
        const isLocationExist = await locationServices.getLocationById(locationId);
        if (!isLocationExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Location does not exist"
            })
        };

        const rack = []
        if (isRackAdded) {
            let filteredArray = rackId.filter(function (item) {
                return item.trim() !== '';
            });
            const arrLength = filteredArray.length
            for (let i = 0; i < arrLength; i++) {
                const element = filteredArray[i];
                const result = await rackServices.getRackById(element);
                if (!result) {
                    return response.status(200).json({
                        status: "FAILED",
                        message: "Rack does not exist."
                    })
                } else {
                    rack.push(
                        result?.rackNo
                    )
                }
            }
        }

        const dataToInsert = {
            locationId,
            location: isLocationExist?.name,
            blockNo: blockNo?.toString(),
            isRackAdded,
            rackId,
            rackNo: rack,
            isDeleted: false
        }

        //insert data into db & send response to client
        const result = await blockServices.createBlock(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Block added successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to add block, Please try again!",
            });
            return;
        };
    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};
module.exports = createBlock;