// const { isJWT } = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/userModel");
const cloudinary = require("cloudinary").v2;

async function registerUser(req, res) {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "missing Details" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const imageUrl =
      "https://res.cloudinary.com/drztraetu/image/upload/v1756130350/images/v7lq2wbvmrtpnvivwqfw.png";

    const userdata = { name, email, password: hashPassword, image: imageUrl };
    const newUser = new User(userdata);
    const user = await newUser.save();
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res.cookie("usertoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod, false locally
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({ success: true, message: "User created", user });
  } catch (err) {
    console.log(err.message);

    res.status(400).json({ success: false, message: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid Credentials");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res.cookie("usertoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod, false locally
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({ success: true, message: "User Logged", user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getUserProfile(req, res) {
  try {
    const data = req.user;
    res.status(200).json({ success: true, user: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function UpdateProfile(req, res) {
  try {
    const userId = req.user._id;
    const data = req.body;
    if (!data.dob || data.dob === "null") {
      delete data.dob;
    }
    console.log(req.body);
    

    // Update basic fields
    let newdata = await User.findByIdAndUpdate(userId, data, { new: true });

    // If file uploaded, update image too
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      newdata = await User.findByIdAndUpdate(
        userId,
        { image: imageUrl },
        { new: true }
      );

      return res.status(201).json({
        success: true,
        message: "Data updated with image",
        user: newdata,
      });
    }
    console.log("111");
    

    // Only runs if no file uploaded
    return res.status(201).json({
      success: true,
      message: "Data updated",
      user: newdata,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function Userlogout(req, res) {
  try {
    res.clearCookie("usertoken");
    res.status(200).json({ success: true, message: "User loggedOut" });
  } catch (err) {
    res.status(400).json({ success: true, message: err.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  Userlogout,
  UpdateProfile,
};
