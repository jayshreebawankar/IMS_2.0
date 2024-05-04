const blockServices = require("../../service/block.services");
const inventoryServices = require("../../service/inventory.service");
const locationServices = require("../../service/location.service");
const userServices = require("../../service/user.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateLocationValidation } = require("../../utils/validation/location.validation");


const updateLocation = async (request, response) => {
    try {
        //extract data from request body
        const { locationId, name } = request.body;

        //check validation
        const validationResult = await updateLocationValidation.validate({ locationId, name }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check location exist or not
        const isExist = await locationServices.getLocationById(locationId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Location does not exist"
            });
        };

        //check updated location name is not similar to the existing one
        if (!(isExist?.name === name)) {
            const isLocationNameExist = await locationServices.getLocationName(name);
            if (isLocationNameExist) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `${name} location is already exist.`
                });
            };
        };


        const dataToUpdate = {
            name: name?.toLowerCase()
        };

        //check block exist under this location or not
        const isBlockExist = await blockServices.getBlockByLocationId(locationId);

        //check stock exist under this location or not
        const isStockExist = await inventoryServices.getStockByLocationId(locationId);

        //check user exist under this location or not
        const isUserExist = await userServices.getUserByLocationId(locationId);

        //update data into db and send response to client
        const result = await locationServices.updateLocationDetails(locationId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            if (isBlockExist?.length > 0) {
                const dataToUpdate = {
                    location: name
                };
                const updateBlockDetails = await blockServices.updateBlockByLocationId(locationId, dataToUpdate);
            };

            if (isStockExist?.length > 0) {
                const dataToUpdate = {
                    location: name
                };
                const updateStockDetail = await inventoryServices.updateStockByLocationId(locationId, dataToUpdate);
            };

            if (isUserExist?.length > 0) {
                const dataToUpdate = {
                    location: name
                };
                const updateUserDetails = await userServices.updateUserByLocationId(locationId, dataToUpdate);
            };

            response.status(200).json({
                status: "SUCCESS",
                message: "Location updated successfully"
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to update location"
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

module.exports = updateLocation;