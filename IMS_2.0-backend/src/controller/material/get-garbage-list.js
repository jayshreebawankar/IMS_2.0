const garbageServices = require("../../service/garbage.service");
const materialServices = require("../../service/material.service");

const garbageList = async (request, response) => {
    try {
        const { page, searchString } = request.body

        const result = await garbageServices.getGarbageList(page, searchString);
        if (result?.totalPages) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Garbage list fetched successfully",
                ...result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Garbage data not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = garbageList