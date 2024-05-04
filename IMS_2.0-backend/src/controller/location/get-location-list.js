const locationServices = require("../../service/location.service");

const getLocationList = async (request, response) => {
    try {
        const { page, searchString } = request.body;
        //get data into db & send response to client
        const result = await locationServices.getLocationList(page, searchString);
        if (result.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Location fetch successfully",
                ...result
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
module.exports = getLocationList;