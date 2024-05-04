const blockServices = require("../../service/block.services");
const locationServices = require("../../service/location.service");
const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateBlockValidation } = require("../../utils/validation/block.validation");


const updateBlock = async (request, response) => {
    try {
        //extract data from request body
        const { blockId, locationId, blockNo, isRackAdded, rackId } = request.body;

        //check validation
        const validationResult = await updateBlockValidation.validate({ blockId, locationId, blockNo, isRackAdded, rackId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check block exist or not
        const isExist = await blockServices.getBlockById(blockId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Block does not exist"
            });
        };

        if (isExist?.isDeleted === true) {
            return response.status(200).json({
                status: "FAILED",
                message: "Block does not exist"
            });
        };

        //check location exist or not
        const isLocationExist = await locationServices.getLocationById(locationId);
        if (!isLocationExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Location does not exist"
            })
        };


        //ensure block no should not be similar to the existing one
        if (!(isExist?.blockNo === blockNo?.toString())) {
            const isBlockExist = await blockServices.getBlockByBlockNo(blockNo);
            if (isBlockExist) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Block number ${blockNo} is already exist.`
                });
            };
        };

        const rack = []
        if (isRackAdded) {
            const arrLength = rackId.length
            for (let i = 0; i < arrLength; i++) {
                const element = rackId[i];
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
        };

        const dataToUpdate = {
            locationId: locationId.toLowerCase(),
            location: isLocationExist?.name,
            blockNo: blockNo.toString(),
            isRackAdded,
            rackId: rackId ? rackId : isExist?.rackId,
            rackNo: rackId ? rack : isExist?.rackNo
        };

        //update data into db and send response to client
        const result = await blockServices.updateBlockDetails(blockId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Block details updated successfully"
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to update details"
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

module.exports = updateBlock;