const categoryServices = require("../../service/category.service");
const { categoryIdValidation } = require("../../utils/validation/category.validation");



const getCategoryById = async (request, response) => {
    try {
        const categoryId = request.body.categoryId;

        //check validation
        const validationResult = await categoryIdValidation.validate({ categoryId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check category exist or not
        const category = await categoryServices.getCategoryById(categoryId);
        if (category) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Category details fetched successfully",
                category
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Category is not available."
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getCategoryById;