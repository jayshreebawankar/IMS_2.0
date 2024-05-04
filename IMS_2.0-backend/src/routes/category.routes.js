const createCategory = require("../controller/category/create.category");
const deleteSelectedCategory = require("../controller/category/delete-category");
const downloadTemplateForUploadCategory = require("../controller/category/download-category-template");
const categoryList = require("../controller/category/get-active-category");
const getCategoryById = require("../controller/category/get-category-by-id");
const getCategoryList = require("../controller/category/get.all.category");
const importCategory = require("../controller/category/import.category");
const updateCategory = require("../controller/category/update.category");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");


const categoryRoutes = require("express").Router();


categoryRoutes.post("/create-category", authenticateUserJWT, tabAccessMiddleware("category"), createCategory);
categoryRoutes.post("/get-all-category", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("category"), getCategoryList);
categoryRoutes.post("/get-category-by-id", authenticateUserJWT, getCategoryById);
categoryRoutes.post("/update-category", updateCategory);
categoryRoutes.post("/delete-category", authenticateUserJWT, tabAccessMiddleware("category"), deleteSelectedCategory);
categoryRoutes.get("/download-category-template", authenticateUserJWT, tabAccessMiddleware("category"), downloadTemplateForUploadCategory);
categoryRoutes.post("/import-category", authenticateUserJWT, tabAccessMiddleware("category"), importCategory);
categoryRoutes.get("/get-active-category", authenticateUserJWT, checkUserStatusMiddleware, categoryList)



module.exports = categoryRoutes