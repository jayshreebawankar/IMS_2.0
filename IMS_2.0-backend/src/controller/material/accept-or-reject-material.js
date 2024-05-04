const inventoryServices = require("../../service/inventory.service");
const notificationServices = require("../../service/notification.service");
const { changeMaterialStatusValidation } = require("../../utils/validation/material.validation");

const acceptOrRejectMaterial = async (request, response) => {
    try {
        const { id, role } = request;
        //extract data from request body
        const { materialId, status, remark } = request.body;

        //check validation
        const validationResult = await changeMaterialStatusValidation.validate({ materialId, status, remark }, { abortEarly: true });
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

        // const materialAdded = isStockExist?.materialAdded
        // const materialAddedLength = materialAdded?.length

        //check material is return or not
        if (isStockExist?.stockStatus?.toLowerCase() !== "return") {
            return response.status(200).json({
                status: "FAILED",
                message: `You can not ${status?.toLowerCase()} ${isStockExist?.stockStatus?.toLowerCase()} material.`
            })
        };

        //check material already accept or reject or not
        if (isStockExist?.stockStatus?.toLowerCase() === status?.toLowerCase()) {
            return response.status(200).json({
                status: "FAILED",
                message: `Material already ${status}ed`
            })
        };


        const actionStatus = status?.toLowerCase() === "accept" ? "accept" : "assigned"
        const updateLogs = {
            "$set": {
                stockStatus: actionStatus,
                remark: remark ? remark : null
            },
            "$push": {
                "logs": {
                    "action": status?.toLowerCase(),
                    "actionTakenBy": id,
                    "actionDate": new Date()
                }
            }
        };

        const notification = {
            title: `${status} Material`,
            createdBy: id,
            notificationFor: isStockExist?.assignedTo?.toString(),
            isSeen: false
        };

        const description = status?.toLowerCase() === "accept" ? `${role} has approved the ${isStockExist?.modelName} material with the item code ${isStockExist?.itemCode}.` : `${role} has rejected the ${isStockExist?.modelName} material with the item code ${isStockExist?.itemCode}.`
        notification["description"] = description

        const result = await inventoryServices.updateStockMaterial(materialId, updateLogs);
        if (result?.acknowledged && result?.matchedCount) {
            await notificationServices.addNotification(notification);
            request.io.emit("notificationCount", [isStockExist?.assignedTo?.toString()]);
            return response.status(200).json({
                status: "SUCCESS",
                message: `Material ${isStockExist?.modelName} ${status?.toLowerCase()}ed successfully.`
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: `Failed to ${status?.toLowerCase()} material, Please try again`
            })
        };
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = acceptOrRejectMaterial;