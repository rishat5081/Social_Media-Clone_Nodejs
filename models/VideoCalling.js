const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoCallingSchema = new Schema(
  {
    timeOfCall: {
      type: Number,
      required: false,
      default: 0
    },
    caller: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    callee: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "conversations",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("videoCallingDetail", VideoCallingSchema);
