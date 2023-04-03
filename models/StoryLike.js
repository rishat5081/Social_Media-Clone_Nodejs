const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoryLikes = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    storyId: {
      type: Schema.Types.ObjectId,
      ref: "stories",
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

StoryLikes.index({ "$**": "text" });
module.exports = mongoose.model("storyLikes", StoryLikes);
