const Joi = require("joi");

exports.categoryValidation = Joi.object().keys({
    name: Joi.string().required(),
    isReplaceable: Joi.boolean().required()
});


exports.categoryIdValidation = Joi.object().keys({
    categoryId: Joi.string().length(24).required()
});


exports.updateCategoryValidation = Joi.object().keys({
    categoryId: Joi.string().length(24).required(),
    name: Joi.string().required(),
    isReplaceable: Joi.boolean().required()
});


exports.categoryIdsValidationSchema = Joi.object().keys({
    categoryIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
});