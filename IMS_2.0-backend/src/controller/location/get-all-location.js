const locationServices = require("../../service/location.service");

const getLocations = async (request, response) => {
    try {
        //get data into db & send response to client
        const result = await locationServices.getAllLocations();
        if (result.length > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Location fetch successfully",
                result
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "location not available",
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
module.exports = getLocations;