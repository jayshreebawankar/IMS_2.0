const notificationServices = require("../../service/notification.service");
const { validateNotificationId } = require("../../utils/validation/notification.validation");

const deleteNotification = async (request, response) => {
    try {
        //extract data from request body
        const notificationId = request.body.notificationId;

        //check validation
        const validationResult = await validateNotificationId.validate({ notificationId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check notification exist or not
        const isNotificationExist = await notificationServices.getNotificationById(notificationId);
        if (!isNotificationExist) {
            return response.status(200).json({
                status: 'FAILED',
                message: "Notification does not exist."
            });
        };

        const result = await notificationServices.deleteNotification(notificationId);
        if (result?.acknowledged && result?.deletedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: "Notification deleted successfully"
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: "Failed to delete the notification"
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    };
};


module.exports = deleteNotification;