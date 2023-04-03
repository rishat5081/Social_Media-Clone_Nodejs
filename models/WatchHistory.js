const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WatchHistory = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    videosCategory: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

WatchHistory.index({ "$**": "text" });
module.exports = mongoose.model("WatchHistory", WatchHistory);
