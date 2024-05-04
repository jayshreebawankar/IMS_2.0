const parameterServices = require("../../service/parameter.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");


const getParameterList = async (request, response) => {
    try {
        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const parameter = await parameterServices.getParameterList(page, searchString);
        if (parameter?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Parameter fetched successfully.",
                ...parameter
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Parameter does not exist.",
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

module.exports = getParameterList;