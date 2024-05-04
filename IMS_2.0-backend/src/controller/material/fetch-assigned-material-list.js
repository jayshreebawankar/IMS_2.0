const materialServices = require("../../service/material.service")

const getAssignedMaterialList = async (request, response) => {
    try {
        const { id, role } = request;
        //extract data from request body
        const { page, searchString, userId } = request.body;

        //get data from db & send response to client
        const material = await materialServices.getAssignedMaterialList(page, searchString, id, role, userId);
        if (material?.totalPages > 0) {
            response.status(200).json({
                status: "SUCCESS",
                message: "Material fetched successfully.",
                ...material
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "material does not exist.",
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

module.exports = getAssignedMaterialList;