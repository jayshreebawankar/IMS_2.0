const Joi = require("joi");

exports.stockInValidation = Joi.object().keys({
    locationId: Joi.string().length(24).required(),
    categoryId: Joi.string().length(24).required(),
    brandId: Joi.string().length(24).required(),
    blockId: Joi.string().length(24).required(),
    parameterId: Joi.string().length(24).required(),
    rackId: Joi.string().length(24).allow(null, "").optional(),
    status: Joi.string().required(),
    conditionType: Joi.string().required(),
    itemCode: Joi.string().required(),
    modelName: Joi.string().required(),
    serialNo: Joi.string().required(),
    quantity: Joi.number().integer().required(),
    parameter: Joi.object().required(),
    partitionName: Joi.string().allow(null, "").optional()
});

exports.updateStockValidation = Joi.object().keys({
    locationId: Joi.string().length(24).required(),
    stockId: Joi.string().length(24).required(),
    categoryId: Joi.string().length(24).required(),
    brandId: Joi.string().length(24).required(),
    blockId: Joi.string().length(24).required(),
    parameterId: Joi.string().length(24).required(),
    rackId: Joi.string().length(24).allow(null, "").optional(),
    status: Joi.string().required(),
    conditionType: Joi.string().required(),
    itemCode: Joi.string().required(),
    modelName: Joi.string().required(),
    serialNo: Joi.string().required(),
    quantity: Joi.number().integer().required(),
    parameter: Joi.object().required(),
    partitionName: Joi.string().allow(null, "").optional()
});

exports.idValidation = Joi.object().keys({
    stockId: Joi.string().length(24).required(),
});


exports.stockIdsValidationSchema = Joi.object().keys({
    stockIds: Joi.array().min(1).items(Joi.string().length(24).required()).required()
})