const express = require("express");
const authAdmin = require("../Middleware/adminAuth");
const {changeAvailability} = require("../Controllers/doctorController");

const doctorRouter = express.Router();

doctorRouter.patch("/changeAvailablity/:doctorId",authAdmin,changeAvailability);


module.exports = doctorRouter;