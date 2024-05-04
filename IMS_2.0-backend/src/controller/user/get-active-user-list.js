const userServices = require("../../service/user.service");

const activeUsers = async (request, response) => {
    try {
        const user = await userServices.getActiveUser();
        if (user?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Users fetched successfully",
                user
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "User not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = activeUsers;