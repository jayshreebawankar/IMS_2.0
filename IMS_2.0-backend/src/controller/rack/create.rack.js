const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const generateRackPartitions = require("../../utils/helpers/rack-partition-array");
const { rackValidation } = require("../../utils/validation/rack.validation");


const createRack = async (request, response) => {
    try {
        //extract data from request body
        const { rackNo, partition } = request.body;

        //check validation
        const validationResult = await rackValidation.validate({ rackNo, partition }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check rack already exist 
        const isRackExist = await rackServices.getRackByRackNo(rackNo.toString())
        if (isRackExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Rack is already exist",
            });
            return;
        };

        //check rack deleted or not
        const isRackDeleted = await rackServices.isRackExistByRackNo(rackNo?.toString())
        const isDeleted = isRackDeleted?.isDeleted;

        const partitions = await generateRackPartitions(rackNo, partition);
        const dataToInsert = {
            rackNo: rackNo.toString(),
            partition: partition.toString(),
            partitionArray: partitions,
            isActive: true,
            isDeleted: false,
            isRackEmpty: true
        }

        const dataToUpdate = {
            rackNo: rackNo?.toString(),
            partition: partition.toString(),
            partitionArray: partitions,
            isActive: true,
            isDeleted: false
        }

        //insert data into db & send response to client
        if (isDeleted) {
            const result = await rackServices.updateRackByRackNo(rackNo?.toString(), dataToUpdate);
            if (result && result?.matchedCount > 0) {
                response.status(200).json({
                    status: "SUCCESS",
                    message: "Rack added successfully",
                });
                return;
            } else {
                response.status(200).json({
                    status: "FAILED",
                    message: "Failed to add rack, Please try again!",
                });
                return;
            };
        } else {
            const result = await rackServices.createRack(dataToInsert);
            if (result._id) {
                response.status(200).json({
                    status: "SUCCESS",
                    message: "Rack added successfully",
                });
                return;
            } else {
                response.status(200).json({
                    status: "FAILED",
                    message: "Failed to add rack, Please try again!",
                });
                return;
            };
        }
    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};

module.exports = createRack;