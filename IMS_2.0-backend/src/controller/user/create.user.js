const { createUserValidationSchema } = require("../../utils/validation/user.validation");
const userServices = require("../../service/user.service");
const roleServices = require("../../service/role.service");
const checkTabAccess = require("../../utils/helpers/check-user-tab-access");
const locationServices = require("../../service/location.service");

const createUser = async (request, response) => {
    try {
        //extract data from request body
        const { name, email, mobile, password, roleId, locationId } = request.body;

        //check validation
        const validationResult = await createUserValidationSchema.validate({ name, email, mobile: mobile?.toString(), password, roleId, locationId }, { abortEarly: true });
        if (validationResult.error) {
            response.status(200).json({
                status: "FAILED",
                message: validationResult?.error?.details[0]?.message,
            });
            return;
        }

        //check user already exist with mobile no
        const isUserExist = await userServices.getUserByMobile(mobile)
        if (isUserExist) {
            response.status(200).json({
                status: "FAILED",
                message: "User already exist with this mobile",
            });
            return;
        }

        //check role exist or not
        const isRoleExist = await roleServices.getRoleById(roleId);
        if (!isRoleExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Role does not exist"
            })
        };

        //check location exist or not
        const isLocationExist = await locationServices.getLocationById(locationId);
        if (!isLocationExist) {
            return response.status(200).json({
                status: "FAILED",
                message: "Location does not exist"
            })
        };

        let userId;
        //get all users for userId
        const users = await userServices.getLatestCreatedRecord();
        //generate user id
        if (users.length > 0) {
            const lastUserUserId = (Number(users[0].userId.substring(3)) + 1)
            userId = `IMS${lastUserUserId}`
        } else {
            userId = "IMS1000"
        }


        const dataToInsert = {
            name,
            email,
            mobile: mobile?.toString(),
            password,
            roleId,
            role: isRoleExist?.role,
            locationId,
            location: isLocationExist?.name,
            userId,
            isActive: true,
            isDeleted: false
        }

        //insert data into db & send response to client
        const result = await userServices.createUser(dataToInsert);
        if (result._id) {
            response.status(200).json({
                status: "SUCCESS",
                message: "User created successfully",
            });
            return;
        } else {
            response.status(200).json({
                status: "FAILED",
                message: "Failed to create user, Please try again!",
            });
            return;
        }

    } catch (error) {
        return response.status(500).json({
            status: "FAILED",
            message: error.message,
        });
    }
};

module.exports = createUser;