const rackServices = require("../../service/rack.services");

const rackList = async (request, response) => {
    try {
        //get data from db & send response to client
        const result = await rackServices.getActiveRack();
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Active rack fetched successfully.",
                rack: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Rack does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = rackList