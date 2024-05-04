const Joi = require("joi");

exports.blockValidation = Joi.object().keys({
    locationId: Joi.string().length(24).required(),
    blockNo: Joi.string().required(),
    isRackAdded: Joi.boolean().required(),
    rackId: Joi.when('isRackAdded', {
        is: true,
        then: Joi.array().min(1).items().required(),
        otherwise: Joi.allow("", null).optional(),
    })
});


exports.blockIdValidation = Joi.object().keys({
    blockId: Joi.string().length(24).required()
});


exports.updateBlockValidation = Joi.object().keys({
    blockId: Joi.string().length(24).required(),
    locationId: Joi.string().length(24).required(),
    blockNo: Joi.string().required(),
    isRackAdded: Joi.boolean().required(),
    rackId: Joi.when('isRackAdded', {
        is: true,
        then: Joi.array().min(1).items().required(),
        otherwise: Joi.allow("", null).optional(),
    }),
});


exports.blockIdsValidationSchema = Joi.object().keys({
    blockIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
});