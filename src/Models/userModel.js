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
      default:"data:image/webp;base64,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",
      validate: {
        validator: function (val) {
          return validator.isUrl(val);
        },
        message: "is not valid URL",
      },

    },
    address:{
        type:Object,
        default:{line1:"",line2:""}
    },
    gender: {
      type: String,
      default: "not selected",
    },
    dob: {
      type: Date,
      default: "not selected",
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
