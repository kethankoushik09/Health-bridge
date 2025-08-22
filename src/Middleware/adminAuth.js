const jwt = require("jsonwebtoken");

const authAdmin = async (req,res,next) => {
  try {

    const { admintoken } = req.cookies;
    if(!admintoken){
      res.status(400).json({ success: false, message: "please login"});
    }
    const token_decode = await jwt.verify(
      admintoken,
      process.env.JWT_SECRET_KEY
    );
    if (token_decode.email !== process.env.ADMIN_EMAIL) {
      res
        .status(401)
        .json({ success: false, message: "Not Authorized Login Again" });
    }
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = authAdmin;
