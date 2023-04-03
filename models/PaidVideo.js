const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaidVideos = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    payerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true
    },
    paymentFrom: {
      type: String
      //payment from mean donation, tip,payedvideo,deposit
    },
    paymentStatus: {
      type: String
    },
    transactionId: {
      type: String
      //transactionId when user pay from stripe
    },
    transactionType: {
      type: String
      //transactionType is stripe or wallet
    },
    creditAomunt: {
      type: Number
    },
    debitAmount: {
      type: Number
    },
    type: {
      type: String
      //Debit or credit
    },
    totalAmount: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaidVideos", PaidVideos);
