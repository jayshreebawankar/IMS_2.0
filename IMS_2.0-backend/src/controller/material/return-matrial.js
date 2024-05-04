const garbageServices = require("../../service/garbage.service");
const inventoryServices = require("../../service/inventory.service");
const materialServices = require("../../service/material.service");
const notificationServices = require("../../service/notification.service");
const userServices = require("../../service/user.service");
const { returnMaterialValidation } = require("../../utils/validation/material.validation");


const returnMaterial = async (request, response) => {
    try {
        const { id, role } = request
        const { materialId, addedData } = request.body;

        //check validation
        const validationResult = await returnMaterialValidation.validate({ materialId, addedData }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check material exist or not
        const isMaterialExist = await inventoryServices.getStockById(materialId);
        if (!isMaterialExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Stock not exist."
            })
        };

        //check material stock out or not
        if (isMaterialExist?.stockStatus?.toLowerCase() === "stock out") {
            return response.status(200).json({
                status: "FAILED",
                message: "Selected material is already stock out"
            })
        };

        //check selected material is assigned or not
        const isMaterialAssigned = await materialServices.findMaterialById(id, materialId);
        if (!isMaterialAssigned) {
            return response.status(200).json({
                status: "FAILED",
                message: "Selected material is not assigned to you."
            })
        };

        let garbageData = {}
        const addedDataArrayLength = addedData ? addedData?.length : 0
        if (addedDataArrayLength > 0) {
            for (i = 0; i < addedDataArrayLength; i++) {
                const data = addedData[i];
                const getStockInfo = await inventoryServices.getStockById(data);
                const dataToInsert = {
                    stockId: getStockInfo?._id,
                    categoryId: getStockInfo?.categoryId
                }
                garbageData = {
                    actionTakenBy: id,
                    garbageData: dataToInsert
                }
            }
        }

        const log = {
            action: "return material",
            actionTakenBy: id,
            actionDate: new Date(),
        };

        const dataToUpdate = {
            "$set": {
                materialAdded: addedData ? addedData : [],
                stockStatus: "return",
            },
            '$push': {
                logs: log
            }
        };

        const commonNotification = {
            title: "Return Material",
            description: `The ${role} return material`,
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


        //return material
        const returnMaterialResult = await materialServices.returnMaterial(materialId, dataToUpdate)
        if (returnMaterialResult?.acknowledged && returnMaterialResult?.matchedCount > 0) {
            if (Object.keys(garbageData).length > 0) {
                await garbageServices.insertGarbageData(garbageData);
                for (i = 0; i < addedDataArrayLength; i++) {
                    const data = addedData[i];
                    const dataToModify = {
                        "$set": {
                            stockStatus: "added",
                        },
                        '$push': {
                            logs: {
                                action: "added",
                                actionTakenBy: id,
                                actionDate: new Date(),
                            }
                        }
                    }
                    await inventoryServices.updateStockMaterial(data, dataToModify)
                }
            }
            await notificationServices.insertNotification(notification);
            request.io.emit("notificationCount", socketUserId);
            return response.status(200).json({
                status: "SUCCESS",
                message: "Material return successfully"
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to return material, Please try again!"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};

module.exports = returnMaterial;