const jwt = require("jsonwebtoken");

const authDoc = async (req,res,next) => {
  try {

    const { doctortoken } = req.cookies;
    if(!doctortoken){
      res.status(400).json({ success: false, message: "please login"});
    }
    const token_decode = await jwt.verify(
      doctortoken,
      process.env.JWT_SECRET_KEY
    );
    req.doctor = token_decode;
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = authDoc;
