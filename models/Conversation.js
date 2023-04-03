const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    name: {
      type: String,
    },
    members: {
      type: Array,
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", ConversationSchema);
