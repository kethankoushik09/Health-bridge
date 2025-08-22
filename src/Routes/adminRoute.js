const express = require("express");
const {addDoctor,adminLogin,adminLogout} = require("../Controllers/adminController");
const upload = require("../Middleware/multer");
const authAdmin = require("../Middleware/adminAuth");

const adminRouter = express.Router();

adminRouter.post("/addDoctor",authAdmin,upload.single("image"),addDoctor);

adminRouter.post("/logIn",adminLogin);

adminRouter.post ("/logOut",authAdmin,adminLogout);


module.exports = adminRouter;