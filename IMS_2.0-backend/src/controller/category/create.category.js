const categoryServices = require("../../service/category.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { categoryValidation } = require("../../utils/validation/category.validation");

const createCategory = async (request, response) => {
    try {
        //extract data from request body
        const { name, isReplaceable } = request.body;

        //check validation
        const validationResult = await categoryValidation.validate({ name, isReplaceable }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check category already exist 
        const isCategoryExist = await categoryServices.getCategoryByName(name)
        if (isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Category already exist with this name",
            });
            return;
        };

        const dataToInsert = {
            name: name?.toLowerCase(),
            isReplaceable
        }

        //insert data into db & send response to client
        const result = await categoryServices.createCategory(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Category created successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to create category, Please try again!",
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
module.exports = createCategory;