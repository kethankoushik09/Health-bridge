const express = require("express");
const {addDoctor} = require("../Controllers/adminController");
const upload = require("../Middleware/multer");

const adminRouter = express.Router();

adminRouter.post("/addDoctor",upload.single("image"),addDoctor);


module.exports = adminRouter;