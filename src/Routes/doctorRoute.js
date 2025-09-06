const express = require("express");
const {
  changeAvailability,
  docLogin,
  getDocDashboardStats,
  docLogout,
  getLatestBookingsOfDoc,
  getAllDocAppointments,
  getDocProfile
    ,updateDocProfile,cancelAppointment
} = require("../Controllers/doctorController");
const authDoc = require("../Middleware/docAuth");
const authAdmin = require("../Middleware/adminAuth");
const upload = require("../Middleware/multer");

const doctorRouter = express.Router();

doctorRouter.patch(
  "/changeAvailability/:doctorId",
  authAdmin,
  changeAvailability
);
doctorRouter.post("/login", docLogin);
doctorRouter.get("/dashboardStats", authDoc, getDocDashboardStats);
doctorRouter.post("/logout", authDoc, docLogout);
doctorRouter.get("/latestBookings", authDoc, getLatestBookingsOfDoc);
doctorRouter.get("/appointments", authDoc, getAllDocAppointments);
doctorRouter.get("/profile", authDoc, getDocProfile);
doctorRouter.put("/profile", authDoc, upload.single("image"), updateDocProfile);
doctorRouter.post("/cancelAppointment", authDoc, cancelAppointment);

module.exports = doctorRouter;