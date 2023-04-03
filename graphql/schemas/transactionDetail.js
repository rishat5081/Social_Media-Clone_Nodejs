const express = require("express");
const {
  chargeFromStripe,
  successTransactionFromStripe,
  successTransactionFromWallet,
  checkUserWalletBalance,
  checkAvailableBalance,
  getAllEarningDetails,
} = require("../resolvers/transactionDetail");
const router = express.Router();

router.post("/charge_stripe", chargeFromStripe);
router.post("/stripe_transaction", successTransactionFromStripe);
router.post("/wallet_transaction", successTransactionFromWallet);
router.post("/checking_wallet_balance", checkUserWalletBalance);
router.post("/user_available_balance", checkAvailableBalance);
router.get("/getUserEarningDetails", getAllEarningDetails);

module.exports = router;
