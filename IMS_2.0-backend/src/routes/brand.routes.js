const createBrand = require("../controller/brand/create.brand");
const deleteSelectedBrand = require("../controller/brand/delete.brand");
const downloadTemplateForUploadBrand = require("../controller/brand/download-brand-template");
const brandList = require("../controller/brand/get.active.brand");
const getBrandList = require("../controller/brand/get.all.brand");
const getBrandById = require("../controller/brand/get.brand.by.id");
const importBrand = require("../controller/brand/import.brand");
const updateBrand = require("../controller/brand/update-brand");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");


const brandRoutes = require("express").Router();


brandRoutes.post("/create-brand", authenticateUserJWT, tabAccessMiddleware("brand"), createBrand);
brandRoutes.post("/delete-brand", authenticateUserJWT, tabAccessMiddleware("brand"), deleteSelectedBrand);
brandRoutes.get("/download-brand-template", authenticateUserJWT, tabAccessMiddleware("brand"), downloadTemplateForUploadBrand);
brandRoutes.post("/get-brand-by-id", authenticateUserJWT, getBrandById);
brandRoutes.post("/get-all-brand", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("brand"), getBrandList);
brandRoutes.post("/import-brand", authenticateUserJWT, tabAccessMiddleware("brand"), importBrand);
brandRoutes.post("/update-brand", authenticateUserJWT, tabAccessMiddleware("brand"), updateBrand);
brandRoutes.get("/get-active-brand", authenticateUserJWT, checkUserStatusMiddleware, brandList)



module.exports = brandRoutes