const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,   
  Userlogout,
  UpdateProfile
} = require("../Controllers/userController");
const upload = require("../Middleware/multer");
const authUser = require("../Middleware/userAuth");

const userRouter = express.Router();

userRouter.post("/register", upload.none(), registerUser);

userRouter.post("/login", upload.none(), loginUser);

userRouter.get("/getProfile", authUser, getUserProfile);

userRouter.post("/logout", authUser, Userlogout);

userRouter.patch("/editProfile",authUser,upload.single("image"),UpdateProfile);

module.exports = userRouter;
