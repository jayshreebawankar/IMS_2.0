const inventoryServices = require("../../service/inventory.service");
const rackServices = require("../../service/rack.services");
const { rackIdValidation } = require("../../utils/validation/rack.validation");

const rackPartition = async (request, response) => {
    try {
        const rackId = request.body.rackId;

        //check validation
        const validationResult = await rackIdValidation.validate({ rackId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
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

        //get rack partition 
        const originalPartition = await rackServices.getRackPartition(rackId);
        // const partitionPlaced = await inventoryServices.getRackExistingPartition(rackId)
        // Extract partition names from partitionPlaced
        // const placeNames = partitionPlaced.map(place => place.partitionName);
        // const output = originalPartition.partitionArray.filter(partition => !placeNames.includes(partition));
        const filteredPartitions = originalPartition.partitionArray.filter(partition => partition.isRackFilled === false);
        if (filteredPartitions?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Rack partition fetched successfully",
                filteredPartitions
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Partition not available"
            });
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};


module.exports = rackPartition