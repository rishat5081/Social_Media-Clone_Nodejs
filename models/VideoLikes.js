const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoLikes = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true
    },
    likes: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

VideoLikes.index({ "$**": "text" });
module.exports = mongoose.model("videoLikes", VideoLikes);
