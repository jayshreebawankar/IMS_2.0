const brandServices = require("../../service/brand.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { updateBrandValidation } = require("../../utils/validation/brand.validation");

const updateBrand = async (request, response) => {
    try {
        //extract data from request body
        const { brandId, name } = request.body;

        //check validation
        const validationResult = await updateBrandValidation.validate({ brandId, name }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check brand exist or not
        const isExist = await brandServices.getBrandById(brandId);
        if (!isExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Brand does not exist"
            });
        };

        const dataToUpdate = {
            name: name?.toLowerCase()
        };

        //update data into db and send response to client
        const result = await brandServices.updateBrandDetails(brandId, dataToUpdate);
        if (result && result?.matchedCount > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Brand details updated successfully"
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

module.exports = updateBrand;