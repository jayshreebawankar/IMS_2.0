const changeLocationStatus = require("../controller/location/change-location-status");
const createLocation = require("../controller/location/create-location");
const getLocations = require("../controller/location/get-all-location");
const getLocationById = require("../controller/location/get-location-by-id");
const getLocationList = require("../controller/location/get-location-list");
const updateLocation = require("../controller/location/update-location");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");
const tabAccessMiddleware = require("../utils/middleware/tab-access-middleware");



const locationRoutes = require("express").Router();



locationRoutes.post("/create-location", authenticateUserJWT, createLocation);
locationRoutes.get("/get-all-location", authenticateUserJWT, checkUserStatusMiddleware, getLocations);
locationRoutes.post("/get-location-by-id", authenticateUserJWT, getLocationById);
locationRoutes.post("/update-location", authenticateUserJWT, updateLocation);
locationRoutes.post("/change-location-status", authenticateUserJWT, changeLocationStatus)
locationRoutes.post("/get-location-list", authenticateUserJWT, getLocationList)



module.exports = locationRoutes;