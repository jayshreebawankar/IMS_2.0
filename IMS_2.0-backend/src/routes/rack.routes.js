
const createRack = require("../controller/rack/create.rack");
const downloadTemplateForUploadRack = require("../controller/rack/download.rack.template");
const getRackById = require("../controller/rack/get.rack.by.id");
const getRackList = require("../controller/rack/get.rack.list");
const updateRack = require("../controller/rack/update.rack");
const importRackInfo = require("../controller/rack/import.rack.details")
const authenticateUserJWT = require("../utils/middleware/auth");
const changeRackStatus = require("../controller/rack/change-rack-status");
const deleteSelectedRack = require("../controller/rack/delete-rack");
const rackList = require("../controller/rack/get.active.rack");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");


const rackRoutes = require("express").Router();


rackRoutes.post("/create-rack", authenticateUserJWT, tabAccessMiddleware("Rack Management"), createRack);
rackRoutes.post("/get-rack-by-id", authenticateUserJWT, getRackById);
rackRoutes.post("/get-rack-list", authenticateUserJWT, checkUserStatusMiddleware, tabAccessMiddleware("Rack Management"), getRackList);
rackRoutes.post("/update-rack", authenticateUserJWT, tabAccessMiddleware("Rack Management"), updateRack);
rackRoutes.get("/download-rack-template", authenticateUserJWT, tabAccessMiddleware("Rack Management"), downloadTemplateForUploadRack);
rackRoutes.post("/import-rack-data", authenticateUserJWT, tabAccessMiddleware("Rack Management"), importRackInfo);
rackRoutes.post("/change-rack-status", authenticateUserJWT, tabAccessMiddleware("Rack Management"), changeRackStatus);
rackRoutes.post("/delete-rack", authenticateUserJWT, tabAccessMiddleware("Rack Management"), deleteSelectedRack);
rackRoutes.get("/get-active-rack", authenticateUserJWT, rackList);



module.exports = rackRoutes