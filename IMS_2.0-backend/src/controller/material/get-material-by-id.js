const inventoryServices = require("../../service/inventory.service");
const materialServices = require("../../service/material.service");
const { materialIdValidation } = require("../../utils/validation/material.validation");

const getMaterialById = async (request, response) => {
    try {
        const { id, role } = request
        const materialId = request.body.materialId;

        //check validation
        const validationResult = await materialIdValidation.validate({ materialId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check material exist or not
        const material = await inventoryServices.getStockById(materialId)
        if (material) {
            let filteredData = []
            if (material?.categoryId?.isReplaceable === false) {
                const dataToAddList = await inventoryServices.getDataToAddList(id, materialId, role)
                filteredData = dataToAddList.filter(item => item.categoryId.isReplaceable === true);
            }
            material["dataToAddList"] = filteredData
            return response.status(200).json({
                status: "SUCCESS",
                message: "Material details fetched successfully.",
                material
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Material not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getMaterialById