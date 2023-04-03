const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticleSchema = new Schema(
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
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    description: {
      type: String,
      required: false,
    },
    theArticle: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    share: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        userId: {
          type: String,
          required: true,
        },
      },
    ],
    disLikes: [
      {
        userId: {
          type: String,
          required: true,
        },
      },
    ],
    tags: {
      type: Array,
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

module.exports = mongoose.model("article", ArticleSchema);
