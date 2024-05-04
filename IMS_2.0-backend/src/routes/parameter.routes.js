
const createParameter = require("../controller/parameter/create.parameter");
const deleteSelectedParameter = require("../controller/parameter/delete.parameter");
const downloadTemplateForUploadParameter = require("../controller/parameter/download.parameter.template");
const getCategoryWiseParameter = require("../controller/parameter/get-category-wise-parameter");
const getParameters = require("../controller/parameter/get-parameters");
const getParameterList = require("../controller/parameter/get.all.parameter");
const getParameterById = require("../controller/parameter/get.parameter.by.id");
const importParameter = require("../controller/parameter/import.parameter");
const updateParameter = require("../controller/parameter/update.parameter");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");


const parameterRoutes = require("express").Router();


parameterRoutes.post("/create-parameter", authenticateUserJWT, tabAccessMiddleware("parameter"), createParameter);
parameterRoutes.post("/get-all-parameter", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("parameter"), getParameterList);
parameterRoutes.post("/get-parameter-by-id", authenticateUserJWT, getParameterById);
parameterRoutes.post("/update-parameter", authenticateUserJWT, tabAccessMiddleware("parameter"), updateParameter);
parameterRoutes.post("/delete-parameter", authenticateUserJWT, tabAccessMiddleware("parameter"), deleteSelectedParameter);
parameterRoutes.get("/download-parameter-template", authenticateUserJWT, tabAccessMiddleware("parameter"), downloadTemplateForUploadParameter);
parameterRoutes.post("/import-parameter", authenticateUserJWT, tabAccessMiddleware("parameter"), importParameter);
parameterRoutes.post("/get-category-wise-parameter", authenticateUserJWT, getCategoryWiseParameter);
parameterRoutes.get("/get-parameters", authenticateUserJWT, getParameters);




module.exports = parameterRoutes