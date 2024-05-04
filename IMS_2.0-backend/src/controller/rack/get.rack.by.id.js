const rackServices = require("../../service/rack.services");
const { rackIdValidation } = require("../../utils/validation/rack.validation");


const getRackById = async (request, response) => {
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
        const rack = await rackServices.getRackById(rackId);
        if (rack) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Rack details fetched successfully",
                rack
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Rack does not exist."
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getRackById;