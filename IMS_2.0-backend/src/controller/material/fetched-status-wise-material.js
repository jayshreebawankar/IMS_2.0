const materialServices = require("../../service/material.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");

const fetchedStatusWiseMaterialList = async (request, response) => {
    try {
        const tabAccess = request.tab
        const { page, searchString, status } = request.body

        if (status?.toLowerCase() === "accept") {
            const isUserHasAccess = await checkTabAccess(tabAccess, "Stock List");
            if (isUserHasAccess === 0) {
                response.status(200).json({
                    status: "FAILED",
                    message: "You don't have access to this tab."
                })
                return;
            };
        }

        if (status?.toLowerCase() === "sell") {
            const isUserHasAccess = await checkTabAccess(tabAccess, "Inventory Look");
            if (isUserHasAccess === 0) {
                response.status(200).json({
                    status: "FAILED",
                    message: "You don't have access to this tab."
                })
                return;
            };
        }

        if (status?.toLowerCase() === "stock out") {
            const isUserHasAccess = await checkTabAccess(tabAccess, "Stock Out");
            if (isUserHasAccess === 0) {
                response.status(200).json({
                    status: "FAILED",
                    message: "You don't have access to this tab."
                })
                return;
            };
        }

        //fetch accepted material from db and send response to client
        const result = await materialServices.getStatusWiseMaterial(status, page, searchString);

        if (result?.totalPages) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Accepted material fetched successfully",
                ...result
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Material not available"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = fetchedStatusWiseMaterialList;