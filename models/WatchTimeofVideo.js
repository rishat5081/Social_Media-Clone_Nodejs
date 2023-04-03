const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WatchTimeofVideo = new Schema(
  {
    userId: {
      type: String,
      required: false,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    time: {
      type: Number,
      required: true,
      default: 0.0,
    },
    ipAddress: {
      type: String,
      required: true,
      default: "127.0.0.1",
    },
  },
  { timestamps: true }
);

WatchTimeofVideo.index({ "$**": "text" });
module.exports = mongoose.model("WatchTimeofVideo", WatchTimeofVideo);
