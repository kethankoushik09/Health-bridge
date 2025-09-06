const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,   
  Userlogout,
  UpdateProfile,
  bookAppointment,
  getAppointments,
  cancelAppointment
} = require("../Controllers/userController");
const upload = require("../Middleware/multer");
const authUser = require("../Middleware/userAuth");

const userRouter = express.Router();

userRouter.post("/register", upload.none(), registerUser);

userRouter.post("/login", upload.none(), loginUser);

userRouter.get("/getProfile", authUser, getUserProfile);

userRouter.post("/logout", authUser, Userlogout);

userRouter.patch("/editProfile",authUser,upload.single("image"),UpdateProfile);

userRouter.post("/bookAppointment", authUser,bookAppointment);
userRouter.get("/getAppointments", authUser, getAppointments);
userRouter.post("/cancelAppointment", authUser, cancelAppointment);

module.exports = userRouter;
