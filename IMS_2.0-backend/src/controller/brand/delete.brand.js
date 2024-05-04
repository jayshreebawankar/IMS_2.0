const brandServices = require("../../service/brand.services");
const inventoryServices = require("../../service/inventory.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { brandIdsValidationSchema } = require("../../utils/validation/brand.validation");


const deleteSelectedBrand = async (request, response) => {
    try {
        //extract data from request body
        const brandIds = request.body.brandIds;

        //check validation
        const validationResult = await brandIdsValidationSchema.validate({ brandIds }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        const arrayLength = brandIds?.length;
        for (let i = 0; i < arrayLength; i++) {
            const brand = brandIds[i];
            const isBrandExist = await brandServices.getBrandById(brand);
            if (!isBrandExist) {
                return response.status(200).json({
                    status: 'FAILED',
                    message: "Brand does not exist."
                });
            };

            //check block is in used or not
            const isBrandUsed = await inventoryServices.getBrandWiseStock(brand)
            if (isBrandUsed?.length > 0) {
                return response.status(200).json({
                    status: "FAILED",
                    message: `${isBrandExist?.name} brand is in use, it cannot be deleted.`
                })
            }
        };

        //delete the selected brand from db and send response to client
        let result = await brandServices.deleteSelectedBrand(brandIds);
        if (result && result?.matchedCount > 0) {
            return response.status(200).json({
                status: 'SUCCESS',
                message: 'Brand deleted successfully.'
            });
        } else {
            return response.status(200).json({
                status: 'FAILED',
                message: 'Failed to delete brand.'
            });
        };
    } catch (error) {
        return response.status(500).json({
            status: 'FAILED',
            message: error.message
        });
    }
};

module.exports = deleteSelectedBrand;