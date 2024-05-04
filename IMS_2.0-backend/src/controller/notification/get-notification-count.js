const notificationServices = require("../../service/notification.service");
const userServices = require("../../service/user.service");


const getNotificationCount = async (request, response) => {
    try {
        //extract data from request body
        const id = request.id;

        //check user exist or not
        const isUserExist = await userServices.getUserByObjId(id);
        if (!isUserExist) {
            return response.status(200).json({
                status: 'FAILED',
                message: 'User not exist'
            });
        };

        //get notification count for the user
        const notification = await notificationServices.getNotificationCount(id);
        if (notification) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Notification count fetched successfully.",
                notification
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Notification is not available."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    };
};

module.exports = getNotificationCount;