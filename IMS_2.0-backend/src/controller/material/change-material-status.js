const inventoryServices = require("../../service/inventory.service");
const rackServices = require("../../service/rack.services");
const userServices = require("../../service/user.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { stockOutValidation } = require("../../utils/validation/material.validation");
const notificationServices = require("../../service/notification.service");


const changeMaterialStatus = async (request, response) => {
    try {
        //check user have access of this tab or not
        const { tab, id, role } = request

        //extract data from request body
        const { stockId, status } = request.body;

        if (status?.toLowerCase() === "sell") {
            const isUserHasAccess = await checkTabAccess(tab, "Inventory Look");
            if (isUserHasAccess === 0) {
                response.status(200).json({
                    status: "FAILED",
                    message: "You don't have access to this tab."
                })
                return;
            };
        };

        if (status?.toLowerCase() === "stock out") {
            const isUserHasAccess = await checkTabAccess(tab, "Stock Out");
            if (isUserHasAccess === 0) {
                response.status(200).json({
                    status: "FAILED",
                    message: "You don't have access to this tab."
                })
                return;
            };
        }

        //check validation
        const validationResult = await stockOutValidation.validate({ stockId, status: status?.toLowerCase() }, { abortEarly: true });
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

        if (status?.toLowerCase() === "stock out") {
            //check stock is return or not
            if (isExist?.stockStatus?.toLowerCase() !== "sell") {
                return response.status(200).json({
                    status: "FAILED",
                    message: `You can not stock out ${isExist?.stockStatus?.toLowerCase()} material.`
                })
            };
        }

        if (status?.toLowerCase() === "sell") {
            //check material stock out or not
            if (isExist?.stockStatus?.toLowerCase() !== "accept" && isExist?.amount === null) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `The selected material cannot be sold as the amount is not entered.`
                })
            }
        }

        //check stock is already stock-out or not
        if (isExist?.stockStatus?.toLowerCase() === status?.toLowerCase()) {
            return response.status(200).json({
                status: "FAILED",
                message: `Stock is already ${status}`
            })
        };

        const dataToModify = {
            stockStatus: status?.toLowerCase()
        }

        if (status?.toLowerCase() === "sell") {
            dataToModify["soldDate"] = new Date()
        }

        const dataToUpdate = {
            "$set": dataToModify,
            $push: {
                logs: {
                    action: status?.toLowerCase(),
                    actionTakenBy: id,
                    actionDate: new Date()
                }
            }
        };

        const descriptionStatus = status?.toLowerCase() === "sell" ? "sold" : "stock out"
        const commonNotification = {
            title: `${status?.toLowerCase()} Material`,
            description: `The ${role} ${descriptionStatus} ${isExist?.modelName} material with item code ${isExist?.itemCode}`,
            createdBy: id,
            isSeen: false
        };

        const notification = []
        const socketUserId = []
        const adminIds = await userServices.getAdminInfo()
        const idArrayLength = adminIds?.length
        if (idArrayLength > 0) {
            for (i = 0; i < idArrayLength; i++) {
                const adminId = adminIds[i]
                notification.push({ notificationFor: adminId?._id?.toString(), ...commonNotification })
                socketUserId.push(adminId?.toString())
            }
        };


        //update data into db and send response to client
        const result = await inventoryServices.updateStockMaterial(stockId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            if (status?.toLowerCase() === "stock out") {
                if (isExist?.rackId) {
                    //after sell material makes sure rack-partition is empty
                    await rackServices.updateRackPartitionStatus(isExist?.rackId, isExist?.partitionName, false)
                }
            }
            await notificationServices.insertNotification(notification);
            request.io.emit("notificationCount", socketUserId);
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


module.exports = changeMaterialStatus;

