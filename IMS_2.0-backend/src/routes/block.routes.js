
const changeBlockStatus = require("../controller/block/change.block.status");
const createBlock = require("../controller/block/create.block");
const deleteSelectedBlock = require("../controller/block/delete.block");
const downloadTemplateForUploadBlock = require("../controller/block/download-block.template");
const getActiveBlock = require("../controller/block/get-active-block");
const getBlockById = require("../controller/block/get-block-by-id");
const getBlockList = require("../controller/block/get-block.list");
const getLocationWiseBlock = require("../controller/block/get-location-wise-block");
const importBrand = require("../controller/block/import.blocks");
const updateBlock = require("../controller/block/update.block");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");


const blockRoutes = require("express").Router();


blockRoutes.post("/create-block", authenticateUserJWT, tabAccessMiddleware("Block Management"), createBlock);
blockRoutes.post("/get-block-by-id", authenticateUserJWT, getBlockById);
blockRoutes.post("/update-block", authenticateUserJWT, tabAccessMiddleware("Block Management"), updateBlock);
blockRoutes.post("/get-all-block", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("Block Management"), getBlockList);
blockRoutes.post("/change-block-status", authenticateUserJWT, tabAccessMiddleware("Block Management"), changeBlockStatus);
blockRoutes.post("/delete-block", authenticateUserJWT, tabAccessMiddleware("Block Management"), deleteSelectedBlock);
blockRoutes.get("/download-block-template", authenticateUserJWT, tabAccessMiddleware("Block Management"), downloadTemplateForUploadBlock);
blockRoutes.post("/import-block", authenticateUserJWT, tabAccessMiddleware("Block Management"), importBrand);
blockRoutes.post("/get-location-wise-block", authenticateUserJWT, getLocationWiseBlock);
blockRoutes.get("/get-active-block", authenticateUserJWT, getActiveBlock);



module.exports = blockRoutes