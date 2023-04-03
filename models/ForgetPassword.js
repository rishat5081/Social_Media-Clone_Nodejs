const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ForgetPassword = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    passcode: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("forgetPassword", ForgetPassword);
