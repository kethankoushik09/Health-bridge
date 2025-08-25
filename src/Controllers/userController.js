// const { isJWT } = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/userModel");

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "missing Details" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const userdata = { name, email, password: hashPassword };
    const newUser = new User(userdata);
    const user = await newUser.save();
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
    res.cookie("usertoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod, false locally
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({success:true,message:"User created"});
  } catch (err) {
    res.status(400).json({success:false,message:err.message});
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    console.log("hiii");
    
    const isValidPassword = await bcrypt.compare(password,user.password);
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
    res.status(200).json({ success: true, message: "User Logged" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}


module.exports = {registerUser,loginUser};