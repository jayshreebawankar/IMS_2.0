const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");

const getRackList = async (request, response) => {
    try {
        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const rack = await rackServices.getRackList(page, searchString);
        if (rack?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Rack fetched successfully.",
                ...rack
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Rack does not exist.",
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

module.exports = getRackList;