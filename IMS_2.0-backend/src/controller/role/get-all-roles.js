const { model } = require("mongoose");
const roleServices = require("../../service/role.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");

const getRoleList = async (request, response) => {
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
        }

        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const result = await roleServices.getRoleList(page, searchString);
        if (result.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Role fetch successfully",
                ...result
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Role not available",
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
module.exports = getRoleList;