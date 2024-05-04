const parameterServices = require("../../service/parameter.service");


const getCategoryWiseParameter = async (request, response) => {
    try {
        const categoryId = request.body.categoryId

        //get data from db & send response to client
        const result = await parameterServices.getParameterByCategoryId(categoryId);
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "parameter fetched successfully.",
                parameter: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "parameter does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = getCategoryWiseParameter