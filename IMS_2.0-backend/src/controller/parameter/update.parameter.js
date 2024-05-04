const categoryServices = require("../../service/category.service");
const parameterServices = require("../../service/parameter.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateParameterValidation } = require("../../utils/validation/parameter.validation");

const updateParameter = async (request, response) => {
    try {
        //extract data from request body
        const { parameterId, parameter, categoryId } = request.body;

        //check validation
        const validationResult = await updateParameterValidation.validate({ parameterId, parameter, categoryId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check brand exist or not
        const isExist = await parameterServices.getParameterById(parameterId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Parameter does not exist"
            });
        };

        //check category exist or not
        const isCategoryExist = await categoryServices.getCategoryById(categoryId);
        if (!isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Category does not exist."
            });
            return;
        };

        //ensure parameter category not similar to the existing one
        if (!(isExist?.categoryId?.toString() === categoryId)) {
            const isCategoryExist = await parameterServices.getParameterByCategoryId(categoryId);
            if (isCategoryExist?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Parameter is already exist for selected category`
                });
            };
        };


        const dataToUpdate = {
            parameter: parameter,
            categoryId,
            name: isCategoryExist?.name
        };

        //update data into db and send response to client
        const result = await parameterServices.updateParameterDetails(parameterId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Parameter details updated successfully"
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

module.exports = updateParameter;