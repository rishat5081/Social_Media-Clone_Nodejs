const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoryViews = new Schema(
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
    view: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

StoryViews.index({ "$**": "text" });
module.exports = mongoose.model("StoryViews", StoryViews);
