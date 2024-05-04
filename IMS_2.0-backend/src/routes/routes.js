const blockRoutes = require("./block.routes");
const brandRoutes = require("./brand.routes");
const categoryRoutes = require("./category.routes");
const inventoryRoutes = require("./inventory.routes");
const locationRoutes = require("./location.routes");
const materialRoutes = require("./material.routes");
const notificationRoutes = require("./notification.routes");
const parameterRoutes = require("./parameter.routes");
const rackRoutes = require("./rack.routes");
const roleRoutes = require("./roles.routes");
const userRoutes = require("./user.routes");

const routes = require("express").Router();

routes.use("/role", roleRoutes);
routes.use("/user", userRoutes);
routes.use("/category", categoryRoutes);
routes.use("/brand", brandRoutes);
routes.use("/parameter", parameterRoutes);
routes.use("/rack", rackRoutes);
routes.use("/block", blockRoutes)
routes.use("/location", locationRoutes)
routes.use("/inventory", inventoryRoutes)
routes.use("/material", materialRoutes);
routes.use("/notification", notificationRoutes)

module.exports = routes;