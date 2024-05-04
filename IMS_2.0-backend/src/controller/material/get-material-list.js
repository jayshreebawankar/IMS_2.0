const brandServices = require("../../service/brand.services");
const categoryServices = require("../../service/category.service");
const inventoryServices = require("../../service/inventory.service");
const { materialValidationSchema } = require("../../utils/validation/material.validation");

const getMaterialList = async (request, response) => {
    try {
        const { categoryId, status, brandId, conditionType, parameter, parametersToMatch, page } = request.body

        //check validation
        const validationResult = await materialValidationSchema.validate({ categoryId, status, brandId, conditionType, parameter, parametersToMatch }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check category exist or not
        const isCategoryExist = await categoryServices.getCategoryById(categoryId);
        if (!isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "category not available",
            });
            return;
        }

        //check brand exist or not
        const isBrandExist = await brandServices.getBrandById(brandId)
        if (!isBrandExist) {
            response.status(200).json({
                status: "FAILED",
                message: "brand not exist",
            });
            return;
        }

        //get material list from db and send response to client
        const result = await inventoryServices.getMaterialList(categoryId, status, brandId, conditionType, parameter, parametersToMatch, page);
        if (result?.totalPages > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Material list fetch successfully",
                ...result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Material not available"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getMaterialList