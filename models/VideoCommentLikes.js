const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoCommentLikes = new Schema(
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
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "videoComments",
      required: true
    }
  },
  { timestamps: true }
);

VideoCommentLikes.index({ "$**": "text" });
module.exports = mongoose.model("videoCommentLikes", VideoCommentLikes);
