const changeStockStatus = require("../controller/inventory/change-stock-status");
const deleteSelectedStock = require("../controller/inventory/delete-stock");
const downloadTemplateForUploadStock = require("../controller/inventory/download-stock-template");
const rackPartition = require("../controller/inventory/get-rack-wise-partition");
const getStockById = require("../controller/inventory/get-stock-by-id");
const getStockList = require("../controller/inventory/get-stock-list");
const importStocks = require("../controller/inventory/import-stock");
const stockIn = require("../controller/inventory/stock-in");
const updateStockIn = require("../controller/inventory/update-stock-entry");

const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");

const inventoryRoutes = require("express").Router();


inventoryRoutes.post("/stock-in", authenticateUserJWT, tabAccessMiddleware("Stock In"), stockIn);
inventoryRoutes.post("/get-stock-list", authenticateUserJWT, checkUserStatusMiddleware, getStockList);
inventoryRoutes.post("/get-stock-by-id", authenticateUserJWT, getStockById);
inventoryRoutes.post("/change-stock-status", authenticateUserJWT, tabAccessMiddleware("Stock In"), changeStockStatus);
// inventoryRoutes.get("/download-stock-template", authenticateUserJWT, downloadTemplateForUploadStock);
// inventoryRoutes.post("/import-stocks", authenticateUserJWT, importStocks)
inventoryRoutes.post("/update-stock", authenticateUserJWT, tabAccessMiddleware("Stock In"), updateStockIn);
inventoryRoutes.post("/get-rack-partition", rackPartition);
inventoryRoutes.post("/delete-stock", authenticateUserJWT, tabAccessMiddleware("Stock In"), deleteSelectedStock)




module.exports = inventoryRoutes;