const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
      default: null,
    },
    lastName: {
      type: String,
      required: false,
      default: null,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      default: null,
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    sideBarAvatar: {
      type: String,
      required: false,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: false,
      default: null,
    },
    location: {
      type: String,
      required: false,
      default: null,
    },
    vyzmo_id: {
      type: Number,
      required: false,
    },
    email: {
      type: String,
      required: false,
      default: null,
      unique: true,
    },

    password: {
      type: String,
      required: false,
      default: null,
    },
    gender: {
      type: String,
      required: false,
      default: null,
    },
    age: {
      type: Number,
      required: false,
      default: null,
    },
    avatar: {
      type: String,
      required: false,
      default: null,
    },
    webLink: {
      type: String,
      required: false,
      default: null,
    },
    about: {
      type: String,
      required: false,
      default: null,
    },
    facebook: {
      type: String,
      required: false,
      default: null,
    },
    tiktok: {
      type: String,
      required: false,
      default: null,
    },
    twitter: {
      type: String,
      required: false,
      default: null,
    },
    instagram: {
      type: String,
      required: false,
      default: null,
    },
    androidDeviceToken: {
      type: String,
      required: false,
      default: "",
    },
    iosDeviceToken: {
      type: String,
      required: false,
      default: "",
    },
    token: {
      type: String,
      required: false,
      default: "",
    },
    online: {
      type: Boolean,
      default: false,
      rerquired: true,
    },
    twoFactorAuthentication: {
      type: Boolean,
      default: false,
      rerquired: true,
    },
    rating: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        points: {
          type: Number,
        },
      },
    ],
    backgroundCover: {
      type: String,
      required: false,
      default: null,
    },
    donationPaypalEmail: {
      type: String,
      rerquired: false,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.index({ username: "text", firstName: "text", lastName: "text" });
module.exports = mongoose.model("user", UserSchema);
