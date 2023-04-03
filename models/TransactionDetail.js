const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionDetailSchema = new Schema(
  {
    userId: {
      type: String
    },
    payerId: {
      type: String
    },
    videoId: {
      type: String
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

module.exports = mongoose.model("transaction_details", TransactionDetailSchema);
