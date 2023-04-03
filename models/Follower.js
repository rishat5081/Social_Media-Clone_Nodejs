const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    followTo: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: false,
        },
      },
    ],
    followBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: false,
        },
      },
    ],
    followers: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("follower", FollowerSchema);
