const brandServices = require("../../service/brand.services");
const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { rackIdsValidationSchema } = require("../../utils/validation/rack.validation");


const deleteSelectedRack = async (request, response) => {
    try {
        //extract data from request body
        const rackIds = request.body.rackIds;

        //check validation
        const validationResult = await rackIdsValidationSchema.validate({ rackIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = rackIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const rack = rackIds[i];
            const isRackExist = await rackServices.getRackById(rack);
            if (!isRackExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Rack does not exist."
                });
            };

            //check rack is in used or not
            const isRackInUsed = await rackServices.checkRackIsInUsed(rack);
            if (isRackInUsed?.blockResult?.length > 0 || isRackInUsed?.stockResult?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Rack ${isExist?.rackNo} is in use, it cannot be deleted.`
                })
            }
        };

        //delete the selected brand from db and send response to client
        let result = await rackServices.deleteSelectedRack(rackIds);
        if (result && result?.matchedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Rack deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete rack.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedRack;