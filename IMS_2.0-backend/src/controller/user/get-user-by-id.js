const userServices = require("../../service/user.service");
const { userIdValidation } = require("../../utils/validation/user.validation");


const getUserById = async (request, response) => {
    try {
        const userId = request.body.userId;

        //check validation
        const validationResult = await userIdValidation.validate({ userId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        };

        //check user exist or not
        const user = await userServices.getUserByObjId(userId);
        if (user) {
            response.status(200).json({
                status: "SUCCESS",
                message: "User details fetched successfully",
                user
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "User does not exist."
            });
            return;
        }
    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message
        })
    }
};

module.exports = getUserById;