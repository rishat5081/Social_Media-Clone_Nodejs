const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GalleryLikes = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    galleryId: {
      type: Schema.Types.ObjectId,
      ref: "galleries",
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

GalleryLikes.index({ "$**": "text" });
module.exports = mongoose.model("galleriesLikes", GalleryLikes);
