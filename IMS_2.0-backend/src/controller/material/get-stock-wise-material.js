const inventoryServices = require("../../service/inventory.service");
const { IdValidation } = require("../../utils/validation/material.validation");

const getStockWiseMaterial = async (request, response) => {
    try {
        const stockId = request.body.stockId;

        //check validation
        const validationResult = await IdValidation.validate({ stockId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check stock exist or not
        const result = await inventoryServices.getStockWiseMaterial(stockId);
        const parameterArray = Object.keys(result.parameter).map(key => ({
            name: key,
            value: result.parameter[key]
        }));

        result["parameter"] = parameterArray
        if (result) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Stock details fetched successfully",
                stock: result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to get "
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getStockWiseMaterial