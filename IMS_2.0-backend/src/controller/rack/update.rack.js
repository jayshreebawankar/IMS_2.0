const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const generateRackPartitions = require("../../utils/helpers/rack-partition-array");
const { updateRackValidation } = require("../../utils/validation/rack.validation");

const updateRack = async (request, response) => {
    try {
        //check user have access of this tab or not
        const tabAccess = request.tab
        const isUserHasAccess = await checkTabAccess(tabAccess, "Rack Management");
        if (isUserHasAccess === 0) {
            response.status(200).json({
                status: "FAILED",
                message: "You don't have access to this tab."
            })
            return;
        };

        //extract data from request body
        const { rackId, rackNo, partition } = request.body;

        //check validation
        const validationResult = await updateRackValidation.validate({ rackId, rackNo, partition }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check rack exist or not
        const isExist = await rackServices.getRackById(rackId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Rack does not exist"
            });
        };


        const partitions = await generateRackPartitions(rackNo, partition);
        const dataToUpdate = {
            rackNo: rackNo.toString(),
            partition: partition.toString(),
            partitionArray: partitions
        };

        //update data into db and send response to client
        const result = await rackServices.updateRackDetails(rackId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Rack details updated successfully"
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to update details"
            });
            return;
        };
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = updateRack;