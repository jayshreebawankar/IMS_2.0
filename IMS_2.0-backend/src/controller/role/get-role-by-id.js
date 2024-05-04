const roleServices = require("../../service/role.service");
const { roleIdValidation } = require("../../utils/validation/role.validation");


const getRoleById = async (request, response) => {
    try {
        const roleId = request.body.roleId;

        //check validation
        const validationResult = await roleIdValidation.validate({ roleId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check role exist or not
        const role = await roleServices.getRoleById(roleId);
        if (role) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Role details fetched successfully",
                role
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Role is not available."
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

module.exports = getRoleById;