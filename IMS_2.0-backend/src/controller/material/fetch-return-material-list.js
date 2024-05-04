const materialServices = require("../../service/material.service");

//API Used for material List to accept or reject material
const fetchReturnMaterialList = async (request, response) => {
    try {
        const { role, id } = request;
        const { page, searchString } = request.body;

        const result = await materialServices.getReturnMaterialList(page, searchString, id, role);
        if (result?.totalPages) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Return material fetched successfully.",
                ...result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Material not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = fetchReturnMaterialList