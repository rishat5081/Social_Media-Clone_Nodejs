const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    caption: {
      type: String,
      required: false
    },
    typeOfFile: {
      type: String,
      required: false
    },
    thumbnail: {
      type: String,
      required: false
    },
    storyURL: {
      type: String,
      required: false
    },
    views: {
      type: Number,
      default: 0
    },
    share: {
      type: Number,
      default: 0
    },
    isExpire: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("story", StorySchema);
