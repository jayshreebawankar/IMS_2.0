const blockServices = require("../../service/block.services");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");


const getBlockList = async (request, response) => {
    try {
        //extract data from request body
        const { page, searchString } = request.body;

        //get data from db & send response to client
        const block = await blockServices.getBlockList(page, searchString);
        if (block?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Block fetched successfully.",
                ...block
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Block does not exist.",
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
module.exports = getBlockList;