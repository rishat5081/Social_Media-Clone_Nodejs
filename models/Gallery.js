const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    views: {
      type: Number,
      required: false,
      default: 0,
    },
    date: {
      type: String,
      required: false,
    },
    share: {
      type: Number,
      required: false,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    comments: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
        likes: {
          type: Array,
        },
        reply: [
          {
            userId: {
              type: Schema.Types.ObjectId,
              ref: "user",
              required: true,
            },
            text: {
              type: String,
              required: true,
            },
            time: {
              type: Date,
              default: Date.now,
            },
            likes: {
              type: Array,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("gallery", GallerySchema);
