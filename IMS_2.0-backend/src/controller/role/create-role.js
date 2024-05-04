const { model } = require("mongoose");
const roleServices = require("../../service/role.service");
const { createRoleValidation } = require("../../utils/validation/role.validation");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");

const createRole = async (request, response) => {
    try {
        //extract data from request body
        const { role, tab } = request.body;

        //check user have access of this tab or not
        const tabAccess = request.tab
        const isUserHasAccess = await checkTabAccess(tabAccess, "Role Management");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            })
            return;
        }

        //check validation
        const validationResult = await createRoleValidation.validate({ role, tab }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check role already exist 
        const isRoleExist = await roleServices.getRoleByName(role)
        if (isRoleExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Role already exist with this name",
            });
            return;
        }

        const dataToInsert = {
            role: role?.toLowerCase(),
            tab
        }

        //insert data into db & send response to client
        const result = await roleServices.createRole(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Role created successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to create role, Please try again!",
            });
            return;
        }

    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};

module.exports = createRole;