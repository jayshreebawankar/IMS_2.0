const Joi = require("joi");


exports.createUserValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Invalid mobile number format',
    }),
    password: Joi.string().required(),
    roleId: Joi.string().length(24).required(), // Assuming ObjectId is a 24-character hex string
    locationId: Joi.string().length(24).required()
});


//validation for login
exports.loginValidationSchema = Joi.object().keys({
    userId: Joi.string().required(),
    password: Joi.string().min(8).max(16).required(),
});


exports.userIdValidation = Joi.object().keys({
    userId: Joi.string().length(24).required()
});


exports.updateUserValidation = Joi.object().keys({
    userId: Joi.string().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Invalid mobile number format',
    }),
    password: Joi.string().required(),
    roleId: Joi.string().length(24).required(),
    locationId: Joi.string().length(24).required()
});

exports.userIdsValidationSchema = Joi.object().keys({
    userIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
})