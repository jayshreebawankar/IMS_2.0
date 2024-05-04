const Joi = require("joi");

exports.brandValidation = Joi.object().keys({
    name: Joi.string().required()
});


exports.brandIdValidation = Joi.object().keys({
    brandId: Joi.string().length(24).required()
});


exports.updateBrandValidation = Joi.object().keys({
    brandId: Joi.string().length(24).required(),
    name: Joi.string().required()
});


exports.brandIdsValidationSchema = Joi.object().keys({
    brandIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
});