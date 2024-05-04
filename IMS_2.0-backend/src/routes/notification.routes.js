const deleteAllNotification = require("../controller/notification/delete-all-notification");
const deleteNotification = require("../controller/notification/delete-notification");
const deleteSelectedNotification = require("../controller/notification/delete-selected-notification");
const notifications = require("../controller/notification/get-all-notification");
const getNotificationCount = require("../controller/notification/get-notification-count");
const authenticateUserJWT = require("../utils/middleware/auth");
const checkUserStatusMiddleware = require("../utils/middleware/check.user.status.middleware");

const notificationRoutes = require("express").Router();


notificationRoutes.get("/delete-all-notification", authenticateUserJWT, deleteAllNotification);
notificationRoutes.post("/delete-selected-notification", authenticateUserJWT, deleteSelectedNotification);
notificationRoutes.post("/delete-notification", authenticateUserJWT, deleteNotification);
notificationRoutes.get("/get-notification-count", authenticateUserJWT, getNotificationCount);
notificationRoutes.post("/get-all-notification", authenticateUserJWT, checkUserStatusMiddleware, notifications);

module.exports = notificationRoutes