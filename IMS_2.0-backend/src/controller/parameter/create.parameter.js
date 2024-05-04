const categoryServices = require("../../service/category.service");
const parameterServices = require("../../service/parameter.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { parameterValidation } = require("../../utils/validation/parameter.validation");


const createParameter = async (request, response) => {
    try {
        //extract data from request body
        const { parameter, categoryId } = request.body;

        //check validation
        const validationResult = await parameterValidation.validate({ parameter, categoryId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check parameter already exist 
        const isParameterExist = await parameterServices.parametersExistForCategory(categoryId)
        if (isParameterExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Parameter already exist for the selected category"
            });
            return;
        };

        //check category exist or not
        const isCategoryExist = await categoryServices.getCategoryById(categoryId);
        if (!isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Category does not exist."
            });
            return;
        }

        let filteredArray = parameter.filter(function (item) {
            return item.trim() !== '';
        });

        const dataToInsert = {
            parameter: filteredArray,
            categoryId,
            name: isCategoryExist?.name,
            isDeleted: false
        }

        //insert data into db & send response to client
        const result = await parameterServices.createParameter(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Parameter created successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to create parameter, Please try again!",
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

module.exports = createParameter;