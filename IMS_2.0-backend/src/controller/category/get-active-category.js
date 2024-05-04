const categoryServices = require("../../service/category.service");

const categoryList = async (request, response) => {
    try {
        //get data from db & send response to client
        const result = await categoryServices.getActiveCategory();
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Category fetched successfully.",
                category: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Category does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = categoryList