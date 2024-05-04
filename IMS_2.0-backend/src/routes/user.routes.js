const changeUserStatus = require("../controller/user/change-user-status");
const createUser = require("../controller/user/create.user");
const deleteSelectedUser = require("../controller/user/delete-user");
const downloadTemplateForUploadUser = require("../controller/user/download-user-template");
const getUserList = require("../controller/user/get-all-users");
const getUserById = require("../controller/user/get-user-by-id");
const importUsers = require("../controller/user/import-users");
const login = require("../controller/user/login");
const updateUser = require("../controller/user/update-user");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");

const userRoutes = require("express").Router();

userRoutes.post("/login", login)
userRoutes.post("/create-user", authenticateUserJWT, tabAccessMiddleware("User Management"), createUser)
userRoutes.post("/get-user-list", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("User Management"), getUserList);
userRoutes.post("/get-user-by-id", authenticateUserJWT, getUserById);
userRoutes.post("/update-user", authenticateUserJWT, tabAccessMiddleware("User Management"), updateUser);
userRoutes.post("/change-user-change", authenticateUserJWT, tabAccessMiddleware("User Management"), changeUserStatus);
userRoutes.post("/delete-user", authenticateUserJWT, tabAccessMiddleware("User Management"), deleteSelectedUser);
userRoutes.get("/download-user-template", authenticateUserJWT, tabAccessMiddleware("User Management"), downloadTemplateForUploadUser);
userRoutes.post("/import-users", authenticateUserJWT, tabAccessMiddleware("User Management"), importUsers)

module.exports = userRoutes;