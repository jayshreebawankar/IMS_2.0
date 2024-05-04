const Joi = require("joi");

exports.notificationIdsValidationSchema = Joi.object().keys({
    notificationIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
})

exports.validateNotificationId = Joi.object().keys({
    notificationId: Joi.string().length(24).required()
});