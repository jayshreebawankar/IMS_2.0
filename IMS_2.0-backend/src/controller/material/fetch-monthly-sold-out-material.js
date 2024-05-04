const materialServices = require("../../service/material.service");

const monthlySoldOutMaterial = async (request, response) => {
    try {
        const year = request.body.year;
        //get data from db and send response to client
        const label = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        const soldOutMaterialCount = await materialServices.monthlySoldOutMaterial(year);
        if (soldOutMaterialCount) {
            const soldOutMaterialMonthlyCount = Array(12).fill(0);

            soldOutMaterialCount?.forEach((item) => {
                const index = item.month - 1;
                soldOutMaterialMonthlyCount[index] = item.count;
            });

            return response.status(200).json({
                status: "SUCCESS",
                message: "Monthly sold out material fetched successfully.",
                material: {
                    label,
                    data: soldOutMaterialMonthlyCount
                },
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Sold out material not available."
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
}

module.exports = monthlySoldOutMaterial;