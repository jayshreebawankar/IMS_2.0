const brandServices = require("../../service/brand.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");


const getBrandList = async (request, response) => {
    try {
        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const brand = await brandServices.getBrandList(page, searchString);
        if (brand?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Brand fetched successfully.",
                ...brand
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Brand does not exist.",
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
module.exports = getBrandList;