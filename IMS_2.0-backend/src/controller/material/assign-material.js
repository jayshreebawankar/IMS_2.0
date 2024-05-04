const { ObjectId } = require("mongodb");
const inventoryServices = require("../../service/inventory.service");
const userServices = require("../../service/user.service");
const { assignMaterialValidation } = require("../../utils/validation/material.validation");
const materialServices = require("../../service/material.service");
const rackServices = require("../../service/rack.services");
const notificationServices = require("../../service/notification.service");


const assignMaterial = async (request, response) => {
    try {
        const { id, role } = request
        const { stockIds, userId } = request.body

        //check validation
        const validationResult = await assignMaterialValidation.validate({ stockIds, userId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check user exist or not
        const isUserExist = await userServices.getUserByObjId(userId);
        if (!isUserExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "User not exist"
            })
        };

        const dataToInsert = []
        const partitionArray = []
        //check stock exist or not
        const arrayLength = stockIds?.length
        for (let i = 0; i < arrayLength; i++) {
            const stock = stockIds[i];
            const isStockExist = await inventoryServices.getStockById(stock);
            if (!isStockExist) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Stock not exist`
                })
            };

            if (isStockExist?.assignedTo !== null) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Material ${isStockExist?.modelName} is already assigned.`
                })
            };

            if (!(["new", "reject"].includes(isStockExist?.stockStatus?.toLowerCase()))) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `You can not assign ${isStockExist?.stockStatus} material.`
                })
            }

            partitionArray.push({
                rackId: isStockExist?.rackId,
                partitionName: isStockExist?.partitionName
            })

            dataToInsert.push(
                {
                    stockId: stock,
                    userId
                }
            )
        };

        const updateLogs = {
            "$set": {
                "assignedTo": new ObjectId(userId),
                "stockStatus": "assigned",
                "assignedBy": id
            },
            "$push": {
                "logs": {
                    "assignedBy": id,
                    "assignedTo": new ObjectId(userId),
                    "action": "assigned",
                    "assignDate": new Date()
                }
            }
        };

        const notification = {
            title: "Assigned Material",
            description: `The ${role} assigned material.`,
            createdBy: id,
            notificationFor: userId?.toString(),
            isSeen: false
        };


        const result = await materialServices.assignMaterial(dataToInsert)
        if (result?.length) {
            await inventoryServices.updateLogs(stockIds, updateLogs);
            //after assign material makes sure rack-partition is empty
            const updateRackPartitionStatus = await rackServices.updatePartitionStatus(partitionArray?.map(ele => ({
                updateOne: {
                    filter: { _id: new ObjectId(ele.rackId?.toString()), "partitionArray.partitionName": ele?.partitionName },
                    update: { isRackFilled: false }
                }
            })));
            await notificationServices.addNotification(notification);
            request.io.emit("notificationCount", [userId]);
            return response.status(200).json({
                status: "SUCCESS",
                message: "Material assigned successfully"
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Failed to assign material, Please try again"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};


module.exports = assignMaterial;