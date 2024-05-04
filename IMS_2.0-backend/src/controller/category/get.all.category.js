const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const categoryServices = require("../../service/category.service");

const getCategoryList = async (request, response) => {
    try {
        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const category = await categoryServices.getCategoryList(page, searchString);
        if (category?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Category fetched successfully.",
                ...category
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Category does not exist.",
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
module.exports = getCategoryList;