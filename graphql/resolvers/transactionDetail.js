const TransactionDetail = require("../../models/TransactionDetail");
const User = require("../../models/User");
const VyzmoWallet = require("../../models/VyzmoWallet");
const { errorName } = require("../error/constants");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const _ = require("lodash");

const { getEarningInfo } = require("../../helpers/transactionDetails");
exports.chargeFromStripe = async (req, res) => {
  const { price, token, type } = req.body;
  const amount = Number(price) * 100;
  try {
    const charge = await stripe.charges.create(
      {
        amount: amount,
        currency: "EUR",
        description: type,
        source: token
      },
      { apiKey: process.env.STRIPE_SECRET_KEY }
    );
    return res.status(200).json({ charge });
  } catch (error) {
    console.log(
      "🚀 ~ file: transactionDetail.js ~ line 19 ~ exports.createPaymentIntent= ~ error",
      error
    );
    return res.status(400).json({ error: error });
  }
};

exports.successTransactionFromStripe = async (req, res) => {
  const {
    user_id,
    videoId,
    payerId,
    paymentFrom,
    paymentStatus,
    transactionId,
    transactionType,
    amount
  } = req.body;

  if (
    !user_id ||
    !payerId ||
    !paymentFrom ||
    !paymentStatus ||
    !transactionId ||
    !transactionType ||
    !amount
  )
    return res.status(400).json({ message: "someting is missing" });
  let amountPay = Number(amount);
  let commissionPecent = 10;
  let commissionAmount = (commissionPecent / 100) * amountPay;

  let amountAfterCommission = amountPay - commissionAmount;
  if (paymentFrom === "donation") {
    commissionPecent = 3;
    commissionAmount = (commissionPecent / 100) * amountPay;
    amountAfterCommission = amountPay - commissionAmount;
  }

  let nweTransactionDetail = new TransactionDetail({
    userId: user_id,
    payerId,
    paymentFrom,
    paymentStatus,
    transactionId,
    transactionType,
    creditAomunt: amountAfterCommission,
    totalAmount: amountPay,
    debitAmount: 0,
    videoId,
    type: "credit"
  });
  try {
    const tranDetail = await nweTransactionDetail.save();

    let waletDetail = await VyzmoWallet.findOne({ userId: user_id });

    if (waletDetail === null) {
      let newWalletDetail = new VyzmoWallet({
        userId: user_id,
        totalAmount: amountAfterCommission
      });
      await newWalletDetail.save();
    } else {
      let totalBalance =
        Number(waletDetail.totalAmount) + amountAfterCommission;
      const updatedFields = { totalAmount: totalBalance };
      waletDetail = _.extend(waletDetail, updatedFields);
      await waletDetail.save();
    }
    return res
      .status(200)
      .json({ message: "Transaction successfully completed " });
  } catch (error) {
    console.log(
      "🚀 ~ file: transactionDetail.js ~ line 63 ~ exports.successTransactionFromStripe= ~ error",
      error
    );
    return res.status(400).json({ error: error });
  }
};

exports.successTransactionFromWallet = async (req, res) => {
  const {
    user_id,
    videoId,
    payerId,
    paymentFrom,
    transactionType,
    amount,
    password
  } = req.body;

  if (!user_id || !payerId || !paymentFrom || !transactionType || !amount)
    return res.status(400).json({ message: "someting is missing" });

  let isUserExist = await User.findOne({ _id: user_id });

  if (!isUserExist)
    return res.status(400).json({ message: errorName.INVALID_CREDENTIALS });

  const isMatch = await bcrypt.compare(password, isUserExist.password);

  if (!isMatch)
    return res.status(400).json({ message: errorName.INVALID_CREDENTIALS });

  let amountPay = Number(amount);
  let walletPayerDetail = await VyzmoWallet.findOne({ userId: payerId });
  if (!walletPayerDetail)
    return res.status(400).json({
      message:
        "you have no wallet in Vyzmo. kindly add money on vyzmo to create wallet"
    });
  if (walletPayerDetail.totalAmount < amount)
    return res.status(400).json({
      message:
        "you have not enough amount in your wallet to make this transaction"
    });

  let commissionPecent = 10;
  let commissionAmount = (commissionPecent / 100) * amountPay;
  let amountAfterCommission = amountPay - commissionAmount;
  if (paymentFrom === "donation") {
    commissionPecent = 3;
    commissionAmount = (commissionPecent / 100) * amountPay;
    amountAfterCommission = amountPay - commissionAmount;
  }
  try {
    const amountAfterPay = walletPayerDetail.totalAmount - amountPay;
    const updatedFields = { totalAmount: amountAfterPay };
    walletPayerDetail = _.extend(walletPayerDetail, updatedFields);
    await walletPayerDetail.save();

    let newReceviedTransactionDetail = new TransactionDetail({
      userId: user_id,
      payerId,
      paymentFrom,
      paymentStatus: "succeed",
      transactionId: "",
      transactionType,
      creditAomunt: amountAfterCommission,
      totalAmount: amountPay,
      debitAmount: 0,
      videoId,
      type: "credit"
    });

    const receivedTranDetail = await newReceviedTransactionDetail.save();

    let newSenderTransactionDetail = new TransactionDetail({
      userId: payerId,
      payerId: user_id,
      paymentFrom,
      paymentStatus: "succeed",
      transactionId: receivedTranDetail._id,
      transactionType,
      creditAomunt: 0,
      totalAmount: amountPay,
      debitAmount: amountPay,
      videoId,
      type: "debit"
    });

    const senderTran = await newSenderTransactionDetail.save();

    let receiverWaletDetail = VyzmoWallet.findOne({ userId: user_id });
    if (!receiverWaletDetail) {
      let newWalletDetail = new VyzmoWallet({
        userId: user_id,
        totalAmount: amountAfterCommission
      });
      await newWalletDetail.save();
    } else {
      let totalBalance =
        Number(receiverWaletDetail.totalAmount) + amountAfterCommission;
      const updatedFields = { totalAmount: totalBalance };
      receiverWaletDetail = _.extend(receiverWaletDetail, updatedFields);
      await receiverWaletDetail.save();
    }
    return res
      .status(200)
      .json({ message: "Transaction successfully completed " });
  } catch (error) {
    console.log(
      "🚀 ~ file: transactionDetail.js ~ line 116 ~ exports.successTransactionFromWal ~ error",
      error
    );
    return res.status(400).json({ message: "someting is missing" });
  }
};

exports.checkUserWalletBalance = async (req, res) => {
  const { user_id, amount } = req.body;
  let amountPay = Number(amount);

  const walletDetail = await VyzmoWallet.findOne({ userId: user_id });
  if (!walletDetail)
    return res.status(400).json({
      message:
        "you have no wallet in Vyzmo. kindly add money on vyzmo to create wallet"
    });
  if (walletDetail.totalAmount < amountPay)
    return res.status(400).json({
      message:
        "you have not enough amount in your wallet to make this transaction"
    });

  return res.status(200).json({ message: "you can make this transaction" });
};

exports.checkAvailableBalance = async (req, res) => {
  const { user_id } = req.body;
  const walletDetail = await VyzmoWallet.findOne({ userId: user_id });
  if (!walletDetail) return res.status(200).json({ balance: 0.0 });
  return res.status(200).json({ balance: walletDetail.totalAmount });
};

exports.getAllEarningDetails = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return new Error(errorName.BAD_REQUEST);
    const earnings = await getEarningInfo(userId);
    if (earnings.length > 0) {
      res.status(200).json(earnings);
    } else {
      res.status(200).json({ message: "No Record found" });
    }
  } catch (error) {
    return new Error(errorName.SERVER_ERROR);
  }
};

// getEarningInfo("620baebb710f5b3a65acca95");
