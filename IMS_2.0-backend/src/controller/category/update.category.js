const categoryServices = require("../../service/category.service");
const parameterServices = require("../../service/parameter.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateCategoryValidation } = require("../../utils/validation/category.validation");


const updateCategory = async (request, response) => {
    try {
        //extract data from request body
        const { categoryId, name, isReplaceable } = request.body;

        //check validation
        const validationResult = await updateCategoryValidation.validate({ categoryId, name, isReplaceable }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check category exist or not
        const isExist = await categoryServices.getCategoryById(categoryId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Category does not exist"
            });
        };

        const dataToUpdate = {
            name: name?.toLowerCase(),
            isReplaceable
        };

        //check parameter exist under this category or not
        const isParameterExist = await parameterServices.getParameterByCategoryId(categoryId);

        //update data into db and send response to client
        const result = await categoryServices.updateCategoryDetails(categoryId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            if (isParameterExist?.length > 0) {
                const dataToUpdate = {
                    name: name?.toLowerCase()
                };
                const updateUserDetails = await parameterServices.updateParameterCategory(categoryId, dataToUpdate);
            };
            response.status(200).json({
                status: "SUCCESS",
                message: "Category details updated successfully"
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to update details"
            });
            return;
        };
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = updateCategory;