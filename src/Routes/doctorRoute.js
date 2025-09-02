const express = require("express");
const {changeAvailability,docLogin,getDocDashboardStats,docLogout} = require("../Controllers/doctorController");
const authDoc = require("../Middleware/docAuth");

const doctorRouter = express.Router();

doctorRouter.patch("/changeAvailability/:doctorId",authDoc,changeAvailability);
doctorRouter.post("/login", docLogin);
doctorRouter.get("/dashboardStats", authDoc, getDocDashboardStats);
doctorRouter.post("/logout", authDoc, docLogout);

module.exports = doctorRouter;