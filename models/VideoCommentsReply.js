const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoCommentsReply = new Schema(
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
    // time: {
    //   type: Date,
    //   default: Date.now
    // },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "videoComments",
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

VideoCommentsReply.index({ "$**": "text" });
module.exports = mongoose.model("videoCommentsReply", VideoCommentsReply);
