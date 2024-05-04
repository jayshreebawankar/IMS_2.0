const notificationServices = require("../../service/notification.service");

const deleteAllNotification = async (request, response) => {
    try {
        //extract mobile number from request
        const id = request.id;

        //delete all notification from db and send response to client
        const result = await notificationServices.deleteAllNotification(id);
        if (result?.acknowledged && result?.deletedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: "Notifications deleted successfully."
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: "Failed to delete notification."
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    };
};

module.exports = deleteAllNotification;