const rackServices = require("../../service/rack.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { rackIdValidation } = require("../../utils/validation/rack.validation");


const changeRackStatus = async (request, response) => {
    try {
        //extract data from request body
        const { rackId } = request.body;

        //check validation
        const validationResult = await rackIdValidation.validate({ rackId }, { abortEarly: true });
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
                message: "The rack does not exist."
            })
        };

        const status = isExist.isActive === true ? 'disable' : "enable";

        if (status?.toLowerCase() === "disable") {
            //check rack is in used or not
            const isRackInUsed = await rackServices.checkRackIsInUsed(rackId);
            if (isRackInUsed?.blockResult?.length > 0 || isRackInUsed?.stockResult?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `Rack ${isExist?.rackNo} is in use, it cannot be disabled.`
                })
            }
        }

        const dataToUpdate = {
            isActive: !isExist.isActive
        };

        //update data into db and send response to client
        const result = await rackServices.updateRackDetails(rackId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: `Rack mark as ${status} successfully`
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: `Failed to mark rack as ${status}`
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


module.exports = changeRackStatus;