const categoryServices = require("../../service/category.service");
const inventoryServices = require("../../service/inventory.service");
const { categoryIdValidation } = require("../../utils/validation/category.validation");


const categoryWiseParameter = async (request, response) => {
    try {
        const categoryId = request.body.categoryId;

        //check validation
        const validationResult = await categoryIdValidation.validate({ categoryId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message
            });
            return;
        };

        //check category exist or not
        const isCategoryExist = await categoryServices.getCategoryById(categoryId);
        if (!isCategoryExist) {
            response.status(200).json({
                status: "FAILED",
                message: "category not available",
            });
            return;
        };

        //get parameter list from db and send response to client
        const result = await inventoryServices.getCategoryWiseParameter(categoryId)
        // const output = {};

        // result.forEach(item => {
        //     const parameters = item.parameter;
        //     // Iterate over the keys of the parameters object
        //     Object.keys(parameters).forEach(key => {
        //         // Check if the key already exists in the output object
        //         if (output[key]) {
        //             // If the value doesn't already exist in the array, push it
        //             if (!output[key].includes(parameters[key])) {
        //                 output[key].push(parameters[key]);
        //             }
        //         } else {
        //             output[key] = [parameters[key]]; // If doesn't exist, create a new array with the value
        //         }
        //     });
        // });
        // if (Object.keys(output).length > 0) {
        //     return response.status(200).json({
        //         status: "SUCCESS",
        //         message: "Parameter fetch successfully",
        //         parameter: output
        //     })
        // }

        const output = [];

        result.forEach(item => {
            const parameters = item.parameter;
            Object.keys(parameters).forEach(key => {
                const existingItem = output.find(entry => entry.modelName === key);
                if (existingItem) {
                    if (!existingItem.parameterList.includes(parameters[key])) {
                        existingItem.parameterList.push(parameters[key]);
                    }
                } else {
                    output.push({
                        modelName: key,
                        parameterList: [parameters[key]]
                    });
                }
            });
        });


        if (output?.length > 0) {
            return response.status(200).json({
                status: "SUCCESS",
                message: "Parameter fetch successfully",
                parameter: output
            })
        } else {
            return response.status(200).json({
                status: "FAILED",
                message: "Parameter not available"
            })
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
}

module.exports = categoryWiseParameter