const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileRating = new Schema(
  {
    profileRatedTo: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    profileRatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

// ProfileRating.index({ username: "text", firstName: "text", lastName: "text" });
module.exports = mongoose.model("profileRating", ProfileRating);
