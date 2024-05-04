const inventoryServices = require("../../service/inventory.service");

const stockOutMaterial = async (request, response) => {
    try {
        const { page, searchString } = request.body;

        //get stock out list from db and send response to client
        const result = await inventoryServices.fetchedStockOutMaterial(page, searchString);
        if (result?.totalPages) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Stock out list fetched successfully",
                ...result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Stock out data not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = stockOutMaterial;