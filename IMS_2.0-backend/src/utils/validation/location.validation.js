const Joi = require("joi");

exports.createLocationValidation = Joi.object().keys({
    name: Joi.string().required()
});

exports.locationIdValidation = Joi.object().keys({
    locationId: Joi.string().length(24).required()
})


exports.updateLocationValidation = Joi.object().keys({
    locationId: Joi.string().length(24).required(),
    name: Joi.string().required()
})