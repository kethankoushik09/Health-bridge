const mongoose = require("mongoose");

const validator = require("validator");
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return validator.isEmail(val);
        },
        message: "is not valid mail",
      },
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (val) {
          return validator.isStrongPassword(val);
        },
        message: "is not valid password",
      },
    },
    image: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    avaliable: {
      type: Boolean,
      default: true,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    slots_booked: {
      type: Object,
      default: {},
      required: true,
    },
  },
  { minimize: true }
);

const Doctor = mongoose.model("Doctors", doctorSchema);

module.exports = Doctor;
