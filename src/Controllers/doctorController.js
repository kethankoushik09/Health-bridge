const Doctor = require("../Models/doctorModel");

async function changeAvailability(req, res) {
  const { doctorId } = req.params;
  try {
    const doctor = await Doctor.findById(doctorId);
    await Doctor.findByIdAndUpdate(doctorId, { avaliable: !doctor.avaliable });
    res.status(200).json({ message: true, message: "changed Availability" });
  } catch (err) {
    res.status(400).json({ message: false, message: err.message });
  }
}

module.exports = {changeAvailability};
