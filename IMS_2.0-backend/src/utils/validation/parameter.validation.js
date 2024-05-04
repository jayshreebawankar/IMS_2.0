const Joi = require("joi");

exports.parameterValidation = Joi.object().keys({
    parameter: Joi.array().min(1).required(),
    categoryId: Joi.string().length(24).required()
});


exports.parameterIdValidation = Joi.object().keys({
    parameterId: Joi.string().length(24).required()
});


exports.updateParameterValidation = Joi.object().keys({
    parameterId: Joi.string().length(24).required(),
    parameter: Joi.array().min(1).required(),
    categoryId: Joi.string().length(24).required()
});


exports.parameterIdsValidationSchema = Joi.object().keys({
    parameterIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
});