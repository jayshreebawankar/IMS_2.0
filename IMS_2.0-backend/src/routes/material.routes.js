
const assignMaterial = require("../controller/material/assign-material");
const getAssignedMaterialList = require("../controller/material/fetch-assigned-material-list");
const categoryWiseParameter = require("../controller/material/get-category-wise-parameter");
const fetchItemCode = require("../controller/material/get-itemCode-list-for-return-material");
const getMaterialById = require("../controller/material/get-material-by-id");
const getMaterialList = require("../controller/material/get-material-list");
const getStockWiseMaterial = require("../controller/material/get-stock-wise-material");
const changeMaterialStatus = require("../controller/material/change-material-status");
const returnMaterial = require("../controller/material/return-matrial");
const activeUsers = require("../controller/user/get-active-user-list");
const authenticateUserJWT = require("../utils/middleware/auth");
const garbageList = require("../controller/material/get-garbage-list");
const fetchReturnMaterialList = require("../controller/material/fetch-return-material-list");
const stockOutMaterial = require("../controller/material/fetch-stock-out-material");
const acceptOrRejectMaterial = require("../controller/material/accept-or-reject-material");
const fetchedStatusWiseMaterialList = require("../controller/material/fetched-status-wise-material");
const enterAmountForMaterial = require("../controller/material/enter-amount-to-accepted-material");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");
const monthlySoldOutMaterial = require("../controller/material/fetch-monthly-sold-out-material");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");

const materialRoutes = require("express").Router();

materialRoutes.post("/get-material-list", authenticateUserJWT, getMaterialList);
materialRoutes.post("/get-category-wise-parameter-for-material", authenticateUserJWT, categoryWiseParameter);
materialRoutes.post("/assigned-material", authenticateUserJWT, assignMaterial);
materialRoutes.post("/fetched-assigned-material-list", authenticateUserJWT, checkUserStatusMiddleware, getAssignedMaterialList);
materialRoutes.get("/get-technician", authenticateUserJWT, activeUsers)
materialRoutes.post("/get-stock-material", authenticateUserJWT, getStockWiseMaterial);
materialRoutes.get("/get-item-code-list", authenticateUserJWT, fetchItemCode);
materialRoutes.post("/get-material-by-id", authenticateUserJWT, getMaterialById);
materialRoutes.post("/return-material", authenticateUserJWT, returnMaterial);
materialRoutes.post("/change-material-status", authenticateUserJWT, changeMaterialStatus);
materialRoutes.post("/fetch-garbage-data", authenticateUserJWT, garbageList)
materialRoutes.post("/fetched-return-material-list", authenticateUserJWT, checkUserStatusMiddleware, fetchReturnMaterialList);
materialRoutes.post("/fetched-stock-out-materials", authenticateUserJWT, stockOutMaterial);
materialRoutes.post("/accept-or-reject-material", authenticateUserJWT, acceptOrRejectMaterial);
materialRoutes.post("/get-status-wise-material-list", authenticateUserJWT, checkUserStatusMiddleware, fetchedStatusWiseMaterialList);
materialRoutes.post("/enter-price-for-material", authenticateUserJWT, tabAccessMiddleware("Stock List"), enterAmountForMaterial);
materialRoutes.post("/monthly-sold-out-material", authenticateUserJWT, tabAccessMiddleware("report"), monthlySoldOutMaterial)



module.exports = materialRoutes