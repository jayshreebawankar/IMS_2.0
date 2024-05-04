const parameterServices = require("../../service/parameter.service");
const { parameterIdValidation } = require("../../utils/validation/parameter.validation");

const getParameterById = async (request, response) => {
    try {
        const parameterId = request.body.parameterId;

        //check validation
        const validationResult = await parameterIdValidation.validate({ parameterId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check parameter exist or not
        const parameter = await parameterServices.getParameterById(parameterId);
        if (parameter) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Parameter details fetched successfully",
                parameter
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Parameter is not available."
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

module.exports = getParameterById;