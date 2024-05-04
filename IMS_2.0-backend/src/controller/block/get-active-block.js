const blockServices = require("../../service/block.services");

const getActiveBlock = async (request, response) => {
    try {
        //get data from db & send response to client
        const result = await blockServices.getActiveBlock();
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Active block fetched successfully.",
                block: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Block does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = getActiveBlock