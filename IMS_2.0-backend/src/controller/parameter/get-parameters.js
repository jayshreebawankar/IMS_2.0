const parameterServices = require("../../service/parameter.service");


const getParameters = async (request, response) => {
    try {
        //get data from db & send response to client
        const parameter = await parameterServices.getParameters();
        if (parameter?.length > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Parameter fetched successfully.",
                parameter
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

module.exports = getParameters;