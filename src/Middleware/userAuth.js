const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const authAdmin = async (req,res,next) => {
  try {

    const { usertoken } = req.cookies;
    if(!usertoken){
      res.status(400).json({ success: false, message: "please login"});
    }
    const token_decode = await jwt.verify(
      usertoken,
      process.env.JWT_SECRET_KEY
    );
    const {id} = token_decode;
    const user = await User.findById(id);
    if(!user){
        throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = authAdmin;
