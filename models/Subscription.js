const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Subscription = new Schema(
  {
    subscribedTo: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    subscribedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    subcriptionKey: {
      type: String,
      required: true,
    },
    customerKey: {
      type: String,
      required: true,
    },
    valid: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { timestamps: true }
);

// Subscription.index({ username: "text", firstName: "text", lastName: "text" });
module.exports = mongoose.model("subscriptions", Subscription);
