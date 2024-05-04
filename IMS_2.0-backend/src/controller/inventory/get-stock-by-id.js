const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const inventoryServices = require("../../service/inventory.service");

const getStockById = async (request, response) => {
    try {
        //extract data from request body
        const { stockId } = request.body;
        //get data from db & send response to client
        const stock = await inventoryServices.getStockById(stockId);
        if (stock) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Stock fetch successfully",
                stock
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "stock not available",
            });
            return;
        }

    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};
module.exports = getStockById;