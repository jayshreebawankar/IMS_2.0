const notificationServices = require("../../service/notification.service");

const notifications = async (request, response) => {
    try {
        //extract mobile number from request
        const id = request.id;

        //extract data from request body
        const { searchString, page } = request.body;

        const notification = await notificationServices.getNotification(id, searchString, page);
        const seenNotification = await notificationServices.markNotificationAsSeen(id);
        request.io.emit("notificationCount", [id]);

        if (notification?.totalPages > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Notification fetched successfully",
                ...notification
            });
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Notification not available"
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        });
    };
};

module.exports = notifications;