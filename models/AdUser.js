const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdUserSchema = new Schema(
  {
    company_name: {
      type: String,
      required: false,
      default: null,
    },
    acc_type: {
      type: String,
      enum: ["ad"],
      default: "ad",
    },
    username: {
      type: String,
      required: false,
      unique: true,
      default: null,
    },
    phone_number: {
      type: String,
      required: false,
      default: null,
    },
    profileImage: {
      type: String,
      required: false,
      default: "",
    },
    email: {
      type: String,
      required: false,
      default: null,
      unique: true,
    },

    password: {
      type: String,
      required: false,
      default: null,
    },
    country: {
      type: String,
      required: false,
      default: null,
    },
    designation: {
      type: String,
      required: false,
      default: null,
    },
    employer_strength: {
      type: String,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("aduser", AdUserSchema);
