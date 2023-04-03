const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BolckUserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    blockedUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("blockuser", BolckUserSchema);
