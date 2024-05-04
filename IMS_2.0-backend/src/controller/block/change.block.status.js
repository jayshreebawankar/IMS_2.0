const blockServices = require("../../service/block.services");
const inventoryServices = require("../../service/inventory.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { blockIdValidation } = require("../../utils/validation/block.validation");


const changeBlockStatus = async (request, response) => {
    try {
        //extract data from request body
        const { blockId } = request.body;

        //check validation
        const validationResult = await blockIdValidation.validate({ blockId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check rack exist or not
        const isExist = await blockServices.getBlockById(blockId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Block does not exist."
            })
        };

        const status = isExist.isActive === true ? 'disable' : "enable";

        if (status?.toLowerCase() === "disable") {
            //check block is in used or not
            const isBlockUsed = await inventoryServices.getBlockWiseStock(blockId)
            if (isBlockUsed?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Selected block is in use, it cannot be disabled.`
                })
            }
        }

        const dataToUpdate = {
            isActive: !isExist.isActive
        };

        //update data into db and send response to client
        const result = await blockServices.updateBlockDetails(blockId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: `Block mark as ${status} successfully`
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: `Failed to mark block as ${status}`
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        });
    };
};


module.exports = changeBlockStatus;