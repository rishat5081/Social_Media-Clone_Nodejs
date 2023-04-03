const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoComments = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true
    }
  },
  { timestamps: true }
);

VideoComments.index({ "$**": "text" });
module.exports = mongoose.model("videoComments", VideoComments);
