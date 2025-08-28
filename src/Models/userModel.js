const mongoose = require("mongoose");

const validator = require("validator");
const { validate } = require("./doctorModel");
const userSchema = new mongoose.Schema(
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
      validate: {
        validator: function (val) {
          return validator.isURL(val);
        },
        message: "is not valid URL",
      },

    },
    address:{
        type:String,
    },
    gender: {
      type: String,
      default: "not selected",
    },
    dob: {
      type: Date,
      default: null
    },
    phone: {
      type: Number,
      validate: {
        validator: function (val) {
          return validator.isMobilePhone(val, "en-IN");
        },
        message: "is not valid phone number",
      },
    },
  },
  { minimize: true }
);

const User = mongoose.model("Users", userSchema);

module.exports = User;
