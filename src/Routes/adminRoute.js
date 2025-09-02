const express = require("express");
const {addDoctor,adminLogin,adminLogout,AllDoctors,getAllAppointments,getLatestBookings,getDashboardStats} = require("../Controllers/adminController");
const upload = require("../Middleware/multer");
const authAdmin = require("../Middleware/adminAuth");

const adminRouter = express.Router();

adminRouter.post("/addDoctor",authAdmin,upload.single("image"),addDoctor);

adminRouter.post("/logIn",adminLogin);

adminRouter.post ("/logOut",authAdmin,adminLogout);

adminRouter.get("/allDoctors",AllDoctors);

adminRouter.get("/appointments",getAllAppointments);
adminRouter.get("/latestBookings",getLatestBookings);
adminRouter.get("/dashboardStats",getDashboardStats);

module.exports = adminRouter;