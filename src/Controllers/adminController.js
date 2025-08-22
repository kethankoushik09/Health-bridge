const Doctor = require("../Models/doctorModel");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function addDoctor(req, res) {
  try {
    const {
      name,
      email,
      password,
      // image,
      speciality,
      avaliable,
      fees,
      date,
      slots_booked,
      address,
      about,
    } = req.body;

    if (
      [
        name,
        email,
        password,
        // image,
        speciality,
        avaliable,
        fees,
        date,
        slots_booked,
        address,
        about,
      ].some((v) => v == null || v === "")
    ) {
      return res.status(400).json({ error: "All fields must be filled" });
    }
    // const imageFile = req.file;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // const imageupload = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "images",
    //   resource_type: "auto",
    // });
    // const imageUrl = imageupload.secure_url;

    const doctordata = {
      name,
      email,
      password: hashedPassword,
      // image: imageUrl,
      avaliable,
      speciality,
      fees,
      date,
      slots_booked,
      address,
      about,
    };

    const newDoctor = new Doctor(doctordata);
    await newDoctor.save();
    res.status(201).json({ sucess: true, msg: "doctor added" });
  } catch (err) {
    res.status(400).json({ sucess: false, error: err.message });
  }
}

async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (
      email == process.env.ADMIN_EMAIL &&
      password == process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY);
      console.log(token);

      res.cookie("admintoken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(200).json({ success: true, message: "successfully loggged" });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

//for AdminLogout

async function adminLogout(req, res) {
  try {
    res.cookie("admintoken", null, {
      httpOnly: true,
      expires: new Date(0), 
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production", 
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
module.exports = { addDoctor, adminLogin ,adminLogout};
