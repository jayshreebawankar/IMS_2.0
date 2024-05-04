const blockServices = require("../../service/block.services");

const getLocationWiseBlock = async (request, response) => {
    try {
        const locationId = request.body.locationId

        //get data from db & send response to client
        const result = await blockServices.getLocationWiseBlock(locationId);
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "block fetched successfully.",
                block: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "block does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = getLocationWiseBlock