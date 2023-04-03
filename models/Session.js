const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sessions: [
      {
        fingerprint: {
          type: String,
          required: true,
        },
        device: {
          type: String,
          required: true,
        },
        browser: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("sessions", SessionSchema);
