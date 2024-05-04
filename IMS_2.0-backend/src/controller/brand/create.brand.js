const brandServices = require("../../service/brand.services");
const categoryServices = require("../../service/category.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const { brandValidation } = require("../../utils/validation/brand.validation");
const { categoryValidation } = require("../../utils/validation/category.validation");

const createBrand = async (request, response) => {
    try {
        //extract data from request body
        const { name } = request.body;

        //check validation
        const validationResult = await brandValidation.validate({ name }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check brand already exist 
        const isBrandExist = await brandServices.getBrandByName(name)
        if (isBrandExist) {
            response.status(200).json({
                status: "FAILED",
                message: "Brand already exist with this name",
            });
            return;
        };

        const dataToInsert = {
            name: name?.toLowerCase(),
            isDeleted: false
        };

        //insert data into db & send response to client
        const result = await brandServices.createBrand(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Brand added successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to add brand, Please try again!",
            });
            return;
        };
    } catch (error) {
        response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
        return;
    }
};
module.exports = createBrand;