const blockServices = require("../../service/block.services");
const { blockIdValidation } = require("../../utils/validation/block.validation");


const getBlockById = async (request, response) => {
    try {
        const blockId = request.body.blockId;

        //check validation
        const validationResult = await blockIdValidation.validate({ blockId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check block exist or not
        const block = await blockServices.getBlockById(blockId);
        if (block) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Block details fetched successfully",
                block
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "block is not available."
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getBlockById;