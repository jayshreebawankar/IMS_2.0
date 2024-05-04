const roleServices = require("../../service/role.service");
const userServices = require("../../service/user.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateRoleValidation } = require("../../utils/validation/role.validation");

const updateRole = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        const isUserHasAccess = await checkTabAccess(tabAccess, "Role Management");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            })
            return;
        };

        //extract data from request body
        const { roleId, role, tab } = request.body;

        //check validation
        const validationResult = await updateRoleValidation.validate({ roleId, role, tab }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check role exist or not
        const isExist = await roleServices.getRoleById(roleId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Role does not exist"
            });
        };

        const dataToUpdate = {
            role: role?.toLowerCase(),
            tab
        };

        //check user exist under this role or not
        const isUserExist = await userServices.getUserByRoleId(roleId);

        //update data into db and send response to client
        const result = await roleServices.updateRoleDetails(roleId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            if (isUserExist?.length > 0) {
                const dataToUpdate = {
                    role: role?.toLowerCase()
                };
                const updateUserDetails = await userServices.updateUserRole(roleId, dataToUpdate);
            };
            response.status(200).json({
                status: "SUCCESS",
                message: "Role details updated successfully"
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

module.exports = updateRole;