const Doctor = require("../Models/doctorModel");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcrypt");

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
    res.status(201).json({ sucess: true, msg:"doctor added"});
  } catch (err) {
    res.status(400).json({ sucess: false, error: err.message });
  }
}

module.exports = { addDoctor };
