const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VyzmoWalletSchema = new Schema(
  {
    userId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("vyzmo_wallets", VyzmoWalletSchema);
