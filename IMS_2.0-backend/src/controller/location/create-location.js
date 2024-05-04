const locationServices = require("../../service/location.service");
const { createLocationValidation } = require("../../utils/validation/location.validation");


const createLocation = async (request, response) => {
    try {
        //extract data from request body
        const { name } = request.body;

        //check validation
        const validationResult = await createLocationValidation.validate({ name }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check location already exist 
        const isLocationExist = await locationServices.getLocationByName(name)
        if (isLocationExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Location already exist with this name",
            });
            return;
        }

        const dataToInsert = {
            name: name?.toLowerCase(),
            isActive: true
        }

        //insert data into db & send response to client
        const result = await locationServices.createLocation(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Location created successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to create Location, Please try again!",
            });
            return;
        }

    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};
module.exports = createLocation;