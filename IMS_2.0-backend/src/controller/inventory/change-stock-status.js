const inventoryServices = require("../../service/inventory.service");
const { idValidation } = require("../../utils/validation/inventory.validation");


const changeStockStatus = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        // const isUserHasAccess = await checkTabAccess(tabAccess, "User Management");
        // if (isUserHasAccess === 0) {
        //     response.status(200).json({
        //         status: "FAILED",
        //         message: "You don't have access to this tab."
        //     })
        //     return;
        // };

        //extract data from request body
        const { stockId } = request.body;

        //check validation
        const validationResult = await idValidation.validate({ stockId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check stock exist or not
        const isExist = await inventoryServices.getStockById(stockId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Stock does not exist"
            })
        };

        const status = isExist.isActive === true ? 'disable' : "enable";

        if (status?.toLowerCase() === "disable") {
            //check stock status before disable it
            if (isExist?.stockStatus?.toLowerCase() !== "new") {
                return response.status(200).json({
                    status: "FAILED",
                    message: `You can not ${status} ${isExist?.stockStatus?.toLowerCase()} stock.`
                })
            }
        }

        const dataToUpdate = {
            isActive: !isExist.isActive
        };

        //update data into db and send response to client
        const result = await inventoryServices.updateStockDetail(stockId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: `Stock mark as ${status} successfully`
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: `Failed to mark stock as ${status}`
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        });
    };
};


module.exports = changeStockStatus;