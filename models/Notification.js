const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    notification_user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false
    },
    count: {
      type: Number,
      require: false
    },
    notifications: [
      {
        actionTitle: {
          type: String,
          required: false
        },
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: false
        },
        avatar: {
          type: String,
          required: false
        },
        username: {
          type: String,
          required: false
        },
        time: {
          type: Date
        },
        video_id: {
          type: Schema.Types.ObjectId,
          ref: "video",
          required: false
        },
        isRead: {
          type: Boolean,
          required: false,
          default: false
        },
        type: {
          type: String,
          required: false
        },
        videoId: {
          type: Schema.Types.ObjectId,
          ref: "video",
          required: false
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("notificaion", NotificationSchema);
