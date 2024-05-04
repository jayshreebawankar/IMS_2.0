const notificationServices = require("../../service/notification.service");
const { notificationIdsValidationSchema } = require("../../utils/validation/notification.validation");

const deleteSelectedNotification = async (request, response) => {
    try {
        //extract data from request body
        const notificationIds = request.body.notificationIds;

        //check validation
        const validationResult = await notificationIdsValidationSchema.validate({ notificationIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = notificationIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const notification = notificationIds[i];
            const isNotificationExist = await notificationServices.getNotificationById(notification);
            if (!isNotificationExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Notification does not exist."
                });
            };
        };

        //delete the selected notification from db and send response to client
        let result = await notificationServices.deleteSelectedNotifications(notificationIds);
        if (result?.acknowledged && result?.deletedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Notifications deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete notification.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedNotification;