const inventoryServices = require("../../service/inventory.service");
const parameterServices = require("../../service/parameter.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { parameterIdsValidationSchema } = require("../../utils/validation/parameter.validation");


const deleteSelectedParameter = async (request, response) => {
    try {
        //extract data from request body
        const parameterIds = request.body.parameterIds;

        //check validation
        const validationResult = await parameterIdsValidationSchema.validate({ parameterIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = parameterIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const parameter = parameterIds[i];
            const isParameterExist = await parameterServices.getParameterById(parameter);
            if (!isParameterExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Parameter does not exist."
                });
            };

            //check parameter is in used or not
            const isParameterInUsed = await inventoryServices.getParameterWiseStock(parameter)
            if (isParameterInUsed?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `${isParameterInUsed?.name} parameter is in use, it cannot be deleted.`
                })
            }
        };

        //delete the selected parameter from db and send response to client
        let result = await parameterServices.deleteSelectedParameter(parameterIds);
        if (result && result?.matchedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Parameter deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete parameter.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedParameter;