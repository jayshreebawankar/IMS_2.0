const Joi = require("joi");

exports.materialValidationSchema = Joi.object().keys({
    categoryId: Joi.string().length(24).required(),
    status: Joi.string().required(),
    brandId: Joi.string().length(24).required(),
    conditionType: Joi.string().required(),
    parameter: Joi.array().allow(null, "").optional(),
    parametersToMatch: Joi.array().allow(null, "").optional(),
});


exports.assignMaterialValidation = Joi.object().keys({
    stockIds: Joi.array().items(Joi.string().length(24).required()).required(),
    userId: Joi.string().length(24).required()
})

exports.IdValidation = Joi.object().keys({
    stockId: Joi.string().length(24).required()
});

exports.returnMaterialValidation = Joi.object().keys({
    materialId: Joi.string().length(24).required(),
    addedData: Joi.array().optional()
});

exports.materialIdValidation = Joi.object().keys({
    materialId: Joi.string().length(24).required()
});

exports.stockOutValidation = Joi.object().keys({
    stockId: Joi.string().length(24).required(),
    status: Joi.string().required()
});


exports.changeMaterialStatusValidation = Joi.object().keys({
    materialId: Joi.string().length(24).required(),
    status: Joi.string().required(),
    remark: Joi.when('status', {
        is: "reject",
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow("", null),
    })
});

exports.materialAmountValidation = Joi.object().keys({
    materialId: Joi.string().length(24).required(),
    amount: Joi.number().options({ convert: false }).required(),
})