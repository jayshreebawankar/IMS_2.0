const locationServices = require("../../service/location.service");
const { locationIdValidation } = require("../../utils/validation/location.validation");

const getLocationById = async (request, response) => {
    try {
        const locationId = request.body.locationId;

        //check validation
        const validationResult = await locationIdValidation.validate({ locationId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check location exist or not
        const location = await locationServices.getLocationById(locationId);
        if (location) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Location details fetched successfully",
                location
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Location is not available."
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

module.exports = getLocationById;