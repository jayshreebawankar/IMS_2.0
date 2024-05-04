const inventoryServices = require("../../service/inventory.service");
const { stockIdsValidationSchema } = require("../../utils/validation/inventory.validation");

const deleteSelectedStock = async (request, response) => {
    try {
        //extract data from request body
        const stockIds = request.body.stockIds;

        //check validation
        const validationResult = await stockIdsValidationSchema.validate({ stockIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = stockIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const stock = stockIds[i];
            const isStockExist = await inventoryServices.getStockById(stock);
            if (!isStockExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Stock does not exist."
                });
            };

            if (isStockExist?.stockStatus?.toLowerCase() !== "new") {
                return response.status(200).json({
                    status: "FAILED",
                    message: `you can not delete ${isStockExist?.stockStatus?.toLowerCase()} stock.`
                })
            }
        };

        //delete the selected brand from db and send response to client
        let result = await inventoryServices.deleteSelectedStock(stockIds);
        if (result && result?.matchedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Stock deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete stock.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedStock;