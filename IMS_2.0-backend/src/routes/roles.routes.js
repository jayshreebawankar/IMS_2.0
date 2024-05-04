const createRole = require("../controller/role/create-role");
const deleteSelectedRole = require("../controller/role/delete-role");
const downloadTemplateForUploadRole = require("../controller/role/download-role-template");
const rolesList = require("../controller/role/fetch-role-list");
const getRoleList = require("../controller/role/get-all-roles");
const getRoleById = require("../controller/role/get-role-by-id");
const importRoles = require("../controller/role/import-roles");
const updateRole = require("../controller/role/update-role");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");

const roleRoutes = require("express").Router();

roleRoutes.post("/create-role", authenticateUserJWT, checkUserStatusMiddleware, createRole);
roleRoutes.post("/get-role-list", authenticateUserJWT, checkUserStatusMiddleware, getRoleList);
roleRoutes.post('/import-role', authenticateUserJWT, checkUserStatusMiddleware, importRoles);
roleRoutes.post("/get-role-by-id", authenticateUserJWT, checkUserStatusMiddleware, getRoleById);
roleRoutes.post("/update-role", authenticateUserJWT, checkUserStatusMiddleware, updateRole);
roleRoutes.get("/download-role-template", authenticateUserJWT, checkUserStatusMiddleware, downloadTemplateForUploadRole);
roleRoutes.post("/delete-role", authenticateUserJWT, checkUserStatusMiddleware, deleteSelectedRole);
roleRoutes.get("/get-active-role", authenticateUserJWT, checkUserStatusMiddleware, rolesList)

module.exports = roleRoutes;