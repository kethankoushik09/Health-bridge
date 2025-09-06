// const { isJWT } = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/userModel");
const Doctor = require("../Models/doctorModel");
const Appointment = require("../Models/appoinmentModel");
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

async function bookAppointment(req, res) {
  try {
    const userId = req.user._id;
    let { docId, slotDate, slotTime, payment } = req.body;

    slotDate = new Date(slotDate).toISOString().split("T")[0];

    const docData = await Doctor.findById(docId).select("-password");
    if (!docData) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    console.log(docData);

    if (!docData.available) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available" });
    }

    // prevent double-booking for the user at same date and time
    const existingAppointment = await Appointment.findOne({
      userId,
      slotDate,
      slotTime,
      cancelled: false,
    });
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an appointment at this time. Please choose another slot.",
      });
    }

    let slots_booked = docData.slots_booked || {};

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Doctor not available at this slot",
          });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await User.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: docData.fees,
      date: new Date(),
      payment,
    };

    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await Doctor.findByIdAndUpdate(docId, { slots_booked: slots_booked });

    res.json({
      success: true,
      message: "Appointment booked",
      appointment: newAppointment,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

async function getAppointments(req, res) {
  try {
    const userId = req.user._id;

    // Fetch all appointments for the logged-in user, sort by date descending
    const appointments = await Appointment.find({ userId })
      .sort({ date: -1 })
      .lean(); // lean() gives plain JS objects
    console.log("appointments", appointments);

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function cancelAppointment(req, res) {
  try {
    const userId = req.user._id;
    const { appointmentId } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
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

    // Mark appointment as cancelled
    appointment.cancelled = true;
    await appointment.save();

    // Free up the slot for the doctor
    const doctor = await Doctor.findById(appointment.docId).lean(); // use lean so we get a plain JS object
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

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  Userlogout,
  UpdateProfile,
  bookAppointment,
  getAppointments,
  cancelAppointment,
};
