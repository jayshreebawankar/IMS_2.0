const inventoryServices = require("../../service/inventory.service");
const { materialAmountValidation } = require("../../utils/validation/material.validation");

const enterAmountForMaterial = async (request, response) => {
    try {
        const role = request.role;

        //extract data from request body
        const { materialId, amount } = request.body;

        if (role !== "admin") {
            return response.status(200).json({
                status: "FAILED",
                message: `Yon can't have access to enter price for material.`
            })
        }

        //check validation
        const validationResult = await materialAmountValidation.validate({ materialId, amount: Number(amount) }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check material exist or not 
        const isStockExist = await inventoryServices.getStockById(materialId);
        if (!isStockExist) {
            return response.status(200).json({
                status: "FAILED",
                message: `Stock not exist`
            })
        };

        if (isStockExist?.stockStatus !== "accept") {
            return response.status(200).json({
                status: "FAILED",
                message: `You can't enter amount for ${isStockExist?.stockStatus} material`
            })
        };

        if (isStockExist?.amount !== null) {
            return response.status(200).json({
                status: "FAILED",
                message: `You already enter amount for selected material.`
            })
        }

        const dataToUpdate = {
            amount: String(amount)
        };

        const result = await inventoryServices.updateStockDetail(materialId, dataToUpdate)
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: `Amount for the ${isStockExist?.modelName} material has been entered successfully.`
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: `Failed, Please try again.`
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = enterAmountForMaterial