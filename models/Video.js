const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    originalVideo: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    // likes: [
    //   {
    //     userId: {
    //       type: Schema.Types.ObjectId,
    //       ref: "user",
    //       required: true,
    //     },
    //   },
    // ],
    // comments: [
    //   {
    //     userId: {
    //       type: Schema.Types.ObjectId,
    //       ref: "user",
    //       required: true,
    //     },
    //     text: {
    //       type: String,
    //       required: true,
    //     },
    //     time: {
    //       type: Date,
    //       default: Date.now,
    //     },
    //     likes: {
    //       type: Array,
    //     },
    //     reply: [
    //       {
    //         userId: {
    //           type: Schema.Types.ObjectId,
    //           ref: "user",
    //           required: true,
    //         },
    //         text: {
    //           type: String,
    //           required: true,
    //         },
    //
    //         time: {
    //           type: Date,
    //           default: Date.now,
    //         },
    //         likes: {
    //           type: Array,
    //         },
    //         commentId: {
    //           type: Schema.Types.ObjectId,
    //           required: true,
    //         },
    //       },
    //     ],
    //   },
    // ],
    reviewPoints: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        point: {
          type: Number,
          required: false,
        },
      },
    ],
    isFeatureVideo: {
      type: Boolean,
      required: false,
    },
    isPremier: {
      type: Boolean,
      required: false,
      default: false,
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    isPaid: {
      type: Boolean,
      required: false,
      default: false,
    },
    priceOfVideo: {
      type: Number,
      required: false,
      default: false,
    },
    videoTitle: {
      type: String,
      required: false,
    },
    videoDescription: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      enum: [
        "Film Animation",
        "Music",
        "Sports",
        "Gaming",
        "Pets and Animals",
        "Travel and Events",
        "People Blogs",
        "Comedy",
        "Entertainment",
        "News and Politics",
        "How-to and Style",
        "Non-profits and Activism",
        "Pranks",
        "Trailers",
        "Food",
        "Motivational",
        "HowTo & Style",
        "Gaming",
        "HUM TV dramas",
        "Funny",
        "HUM TV dramas",
        "Nature",
        "Fashion",
        "Kids",
        "Cars",
        "Decoration",
        "Technology",
        "Motivation",
        "Dancing",
        "Other",
      ],
      required: true,
    },
    privacy: {
      type: String,
      required: false,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    ageRestriction: {
      type: String,
      required: false,
      enum: ["all", "18+"],
      default: "all",
    },
    tags: {
      type: Array,
    },
    price: {
      type: Number,
      required: false,
      default: 0,
    },
    qualities: {
      twoFourty: {
        type: String,
        required: false,
        default: null,
      },
      threeSixty: {
        type: String,
        required: false,
        default: null,
      },
      fourEighty: {
        type: String,
        required: false,
        default: null,
      },
      sevenTwenty: {
        type: String,
        required: false,
        default: null,
      },
      tenEighty: {
        type: String,
        required: false,
        default: null,
      },
    },
    thumbnail: {
      type: String,
      required: false,
      default: null,
    },
    profileViews: [
      {
        fingerprint: { type: String, required: true, default: null },
      },
    ],
    realViews: {
      type: Number,
      required: false,
      default: null,
    },
    share: {
      type: Number,
      required: false,
      default: 0,
    },
    downloads: {
      type: Number,
      required: false,
      default: 0,
    },
    geoLocation: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

VideoSchema.index({ "$**": "text", createdAt: 1, timestamp: 1, realViews: 1 });
VideoSchema.index({ "$**": "number", realViews: 1 });

module.exports = mongoose.model("video", VideoSchema);

var schema = new Schema({
  videoTitle: String,
});
