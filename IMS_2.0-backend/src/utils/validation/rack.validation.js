const Joi = require("joi");

exports.rackValidation = Joi.object().keys({
    rackNo: Joi.number().integer().options({ convert: false }),
    partition: Joi.number().integer().options({ convert: false })
});


exports.rackIdValidation = Joi.object().keys({
    rackId: Joi.string().length(24).required()
});


exports.updateRackValidation = Joi.object().keys({
    rackId: Joi.string().length(24).required(),
    rackNo: Joi.number().integer().options({ convert: false }),
    partition: Joi.number().integer().options({ convert: false })
});


exports.rackIdsValidationSchema = Joi.object().keys({
    rackIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
});