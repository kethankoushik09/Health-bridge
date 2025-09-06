const Doctor = require("../Models/doctorModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Appointment = require("../Models/appoinmentModel");
const User = require("../Models/userModel");
const { default: mongoose } = require("mongoose");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

async function changeAvailability(req, res) {
  const { doctorId } = req.params;
  try {
    const doctor = await Doctor.findById(doctorId);
    await Doctor.findByIdAndUpdate(doctorId, { available: !doctor.available });
    res.status(200).json({ success: true, message: "changed Availability" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function docLogin(req, res) {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.cookie("doctortoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
async function getDocDashboardStats(req, res) {
  try {
    const doctorId = req.doctor.id;
    // console.log(doctorId);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    // Total appointments for this doctor
    const totalAppointments = await Appointment.countDocuments({
      docId: doctorId,
    });
    // console.log(totalAppointments);

    // Unique patients for this doctor
    const patientsAgg = await Appointment.aggregate([
      { $match: { docId: new mongoose.Types.ObjectId(doctorId) } },
      { $group: { _id: "$userId" } },
    ]);
    const totalPatients = patientsAgg.length;

    // Earnings for this doctor
    const earningsAgg = await Appointment.aggregate([
      {
        $match: { docId: new mongoose.Types.ObjectId(doctorId), payment: true },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalEarnings = earningsAgg.length > 0 ? earningsAgg[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        earnings: totalEarnings,
        appointments: totalAppointments,
        patients: totalPatients,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function docLogout(req, res) {
  try {
    res.cookie("doctortoken", null, {
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

async function getLatestBookingsOfDoc(req, res) {
  try {
    const doctorId = req.doctor.id;

    const latest = await Appointment.find({ docId: doctorId })
      .sort({ date: -1 }) // newest first
      .limit(4); // only latest 4

    res.status(200).json({ success: true, latest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllDocAppointments(req, res) {
  try {
    const doctorId = req.doctor.id;

    const appointments = await Appointment.find({ docId: doctorId }).sort({
      date: -1,
    });
    res.status(200).json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getDocProfile(req, res) {
  try {
    const doctorId = req.doctor.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, profile: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateDocProfile(req, res) {
  try {
    const doctorId = req.doctor.id;
    let updateData = { ...req.body };

    // if new image uploaded
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctor_profiles",
      });
      updateData.image = upload.secure_url;

      // remove local temp file
      fs.unlinkSync(req.file.path);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ success: true, doctor: updatedDoctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function cancelAppointment(req, res) {
  try {
    const { appointmentId } = req.body;
    const doctorId = req.doctor.id;

    // check if appointment exists and belongs to doc
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      docId: doctorId,
    });
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (appointment.cancelled) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment already cancelled" });
    }

    appointment.cancelled = true;
    await appointment.save();

    // free up the slot of doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    if (doctor && doctor.slots_booked) {
      let slots_booked = { ...doctor.slots_booked }; // clone into plain object

      const { slotDate, slotTime } = appointment;

      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );

        if (slots_booked[slotDate].length === 0) {
          delete slots_booked[slotDate];
        }
      }

      // now update doctor’s record
      await Doctor.findByIdAndUpdate(doctor._id, { slots_booked });
    }

    res
      .status(200)
      .json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  changeAvailability,
  docLogin,
  getDocDashboardStats,
  docLogout,
  getLatestBookingsOfDoc,
  getAllDocAppointments,
  getDocProfile,
  updateDocProfile,
  cancelAppointment,
};
