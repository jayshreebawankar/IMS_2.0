const blockServices = require("../../service/block.services");
const inventoryServices = require("../../service/inventory.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { blockIdsValidationSchema } = require("../../utils/validation/block.validation");


const deleteSelectedBlock = async (request, response) => {
    try {
        //extract data from request body
        const blockIds = request.body.blockIds;

        //check validation
        const validationResult = await blockIdsValidationSchema.validate({ blockIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = blockIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const block = blockIds[i];
            const isBlockExist = await blockServices.getBlockById(block);
            if (!isBlockExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Block does not exist."
                });
            };

            // if (isBlockExist?.isActive === false) {
            //     return response.status(200).json({
            //         status: 'FAILED',
            //         message: "You can not delete disable block."
            //     });
            // }

            if (isBlockExist?.isDeleted === true) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Block does not exist."
                });
            }

            //check block is in used or not
            const isBlockUsed = await inventoryServices.getBlockWiseStock(block)
            if (isBlockUsed?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Block ${isBlockExist?.blockNo} is in use, it cannot be delete.`
                })
            }
        };

        //delete the selected block from db and send response to client
        let result = await blockServices.deleteSelectedBlock(blockIds);
        if (result && result?.matchedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Block deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete block.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedBlock;