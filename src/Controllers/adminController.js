const Doctor = require("../Models/doctorModel");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Appointment = require("../Models/appoinmentModel");
const User = require("../Models/userModel");

async function addDoctor(req, res) {
  try {
    const {
      name,
      email,
      password,
      degree,
      experience,
      speciality,
      fees,
      address,
      about,
    } = req.body;

    if (
      [
        name,
        email,
        password,
        experience,
        speciality,
        degree,
        fees,
        address,
        about,
      ].some((v) => v == null || v === "")
    ) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(req.file.imageFile);

    const imageupload = await cloudinary.uploader.upload(req.file.path, {
      folder: "images",
      resource_type: "auto",
    });
    const imageUrl = imageupload.secure_url;

    const doctordata = {
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
      experience,
      speciality,
      fees,
      degree,
      address,
      about,
    };

    const newDoctor = new Doctor(doctordata);
    await newDoctor.save();
    res.status(201).json({ success: true, message: "data added" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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

async function AllDoctors(req, res) {
  try {
    const doctors = await Doctor.find({}).select("-password");
    return res.json({ success: true, doctors });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find({});
    return res.json({ success: true, appointments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getLatestBookings(req, res) {
  try {
    const latest = await Appointment.find({})
      .sort({ date: -1 }) // newest first
      .limit(4); // only latest 4
    res.json({ success: true, latest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function getDashboardStats(req, res) {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // Calculate earnings = sum of all appointment amounts
    const earningsAgg = await Appointment.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    res.json({
      success: true,
      stats: {
        earnings: totalEarnings,
        appointments: totalAppointments,
        patients: totalPatients,
        doctors: totalDoctors,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  addDoctor,
  adminLogin,
  adminLogout,
  AllDoctors,
  getAllAppointments,
  getLatestBookings,
  getDashboardStats,
};
