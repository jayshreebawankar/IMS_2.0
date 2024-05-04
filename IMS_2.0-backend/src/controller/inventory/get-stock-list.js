const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const inventoryServices = require("../../service/inventory.service");

const getStockList = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        const isUserHasAccess = await checkTabAccess(tabAccess, "Stock In");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            })
            return;
        }

        //extract data from request body
        const { page, searchString, blockId, categoryId, conditionType, brandId } = request.body;

        //get data from db & send response to client
        const result = await inventoryServices.getStockList(page, searchString, blockId, categoryId, conditionType, brandId);
        if (result.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Stock fetch successfully",
                ...result
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
module.exports = getStockList;