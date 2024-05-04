const inventoryServices = require("../../service/inventory.service");

const fetchItemCode = async (request, response) => {
    try {
        const id = request.id
        const itemCode = await inventoryServices.getItemCodeList(id);
        if (itemCode?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "List fetched successfully",
                itemCode
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Data not available"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = fetchItemCode