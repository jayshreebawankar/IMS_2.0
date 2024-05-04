const Joi = require("joi");


exports.createRoleValidation = Joi.object().keys({
    role: Joi.string().required(),
    tab: Joi.array().min(1).items().required(),
});


exports.roleIdValidation = Joi.object().keys({
    roleId: Joi.string().length(24).required()
});


exports.updateRoleValidation = Joi.object().keys({
    roleId: Joi.string().length(24).required(),
    role: Joi.string().required(),
    tab: Joi.array().min(1).items().required(),
});


exports.roleIdsValidationSchema = Joi.object().keys({
    roleIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
})