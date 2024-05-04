const roleServices = require("../../service/role.service");
const userServices = require("../../service/user.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { roleIdsValidationSchema } = require("../../utils/validation/role.validation");


const deleteSelectedRole = async (request, response) => {
    try {
        //extract tab from request
        const tabAccess = request.tab

        //check tab access
        const isUserHasAccess = await checkTabAccess(tabAccess, "Role Management");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            });
            return;
        };

        //extract data from request body
        const roleIds = request.body.roleIds;

        //check validation
        const validationResult = await roleIdsValidationSchema.validate({ roleIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = roleIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const role = roleIds[i];
            const isRoleExist = await roleServices.getRoleById(role);
            if (!isRoleExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Role does not exist."
                });
            };

            //check user exist under this role or not
            const isRoleUsed = await userServices.getUserByRoleId(role)
            if (isRoleUsed?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Role ${isRoleExist?.role} is in use, it cannot be delete.`
                })
            }
        };

        //delete the selected role from db and send response to client
        const result = await roleServices.deleteSelectedRoles(roleIds);
        if (result.acknowledged && result?.deletedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Role deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete role.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedRole;