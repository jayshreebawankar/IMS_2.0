const roleServices = require("../../service/role.service");

const rolesList = async (request, response) => {
    try {
        //get data from db & send response to client
        const result = await roleServices.getActiveRole();
        if (result?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Role fetched successfully.",
                role: result
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Role does not exist."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = rolesList