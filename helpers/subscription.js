const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51KbeZFKw8NlufAejHx1ibv7QxpVAqWbXmCPLrqiNIcSvGCTVECWCvsvczwKfIvbppiRlbuzMKKvWIyWYrnKPGm5K00Ed53F0ZW"
); // Secret Key
const _ = require("lodash");
const Subscription = require("../models/Subscription");
const VyzmoWallet = require("../models/VyzmoWallet");

const SubscriptionTransaction = require("../models/SubscriptionTransaction");

/***
 *
 */
module.exports = {
  checkSubscriptionofUser: async (subscribedBy, subscribedTo) => {
    return new Promise(async (resolve, rejected) => {
      const subscriptionData = await Subscription.findOne({
        subscribedBy,
        subscribedTo,
        valid: true,
      });
      if (subscriptionData)
        resolve({
          status: true,
          message: "User have Subscription",
        });
      else
        rejected({
          status: false,
          message: "User does not have Subscription",
        });
    });
  },

  chargeFromStripe: async ({ price, token, type }) => {
    const amount = Number(price) * 100;
    try {
      const charge = await stripe.charges.create(
        {
          amount: amount,
          currency: "EUR",
          description: type,
          source: token,
        },
        { apiKey: process.env.STRIPE_SECRET_KEY }
      );
      return charge;
    } catch (error) {
      console.trace(
        "🚀 ~ file: transactionDetail.js ~ line 19 ~ exports.createPaymentIntent= ~ error",
        error
      );
      return false;
    }
  },

  createCustomer: async (email, paymentID) => {
    return new Promise((resolve, rejected) => {
      stripe.customers
        .create({
          email,
          description: `${email} is created for Subscription`,
          payment_method: paymentID,
          invoice_settings: {
            default_payment_method: paymentID,
          },
        })
        .then((result) => {
          console.log("------- createCustomer -------", result);
          resolve(result.id);
        })
        .catch((err) => {
          console.log("------- createCustomer -------", err);

          rejected(err);
        });
    });
  },

  // attachPaymentMethod_Customer: async (customerId, paymentID) => {
  //   return new Promise((resolve, rejected) => {
  //     stripe.paymentMethods
  //       .attach(paymentID, { customer: customerId })
  //       .then((result) => {
  //         console.log("------- attachPaymentMethod_Customer -------", result);
  //         resolve(result.id);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         rejected(err);
  //       });
  //   });
  // },

  createSubscription: async (customer, price) => {
    return new Promise((resolve, rejected) => {
      stripe.subscriptions
        .create({
          customer,
          items: [{ price }],
        })
        .then((result) => {
          console.log("------- createSubscription -------", result);
          resolve(result.id);
        })
        .catch((err) => {
          console.log("------- createSubscription -------", err);
          rejected(err);
        });
    });
  },

  successTransactionFromStripe: async (
    userId,
    subscriptionId,
    payerId,
    paymentFrom,
    paymentStatus,

    amount
  ) => {
    if (
      !userId ||
      !subscriptionId ||
      !payerId ||
      !paymentFrom ||
      !paymentStatus ||
      !amount
    )
      return false;
    else {
      let amountPay = Number(amount);
      let commissionPecent = 10;
      let commissionAmount = (commissionPecent / 100) * amountPay;

      let amountAfterCommission = amountPay - commissionAmount;
      // if (paymentFrom === "donation") {
      //   commissionPecent = 3;
      //   commissionAmount = (commissionPecent / 100) * amountPay;
      //   amountAfterCommission = amountPay - commissionAmount;
      // }

      let newsubscriptionTransaction = new SubscriptionTransaction({
        userId,
        payerId,
        paymentFrom,
        paymentStatus,

        creditAomunt: amountAfterCommission,
        totalAmount: amountPay,
        debitAmount: 0,
        type: "credit",
      });
      try {
        await newsubscriptionTransaction.save();

        let waletDetail = await VyzmoWallet.findOne({ userId });

        if (waletDetail === null) {
          let newWalletDetail = new VyzmoWallet({
            userId,
            totalAmount: amountAfterCommission,
          });
          await newWalletDetail.save();
        } else {
          let totalBalance =
            Number(waletDetail.totalAmount) + amountAfterCommission;
          const updatedFields = { totalAmount: totalBalance };
          waletDetail = _.extend(waletDetail, updatedFields);
          await waletDetail.save();
        }
        return true;
      } catch (error) {
        console.trace(
          "🚀 ~ file: transactionDetail.js ~ line 63 ~ exports.successTransactionFromStripe= ~ error",
          error
        );
        return false;
      }
    }
  },
};

// (async () => {
//   const subscriptionData = await Subscription.findOne({
//     subscribedBy : "6249f19a5ce08325a5c7039e",
//     subscribedTo:"62318774ae8945d38c416dff",
//     valid: true,
//   });
//   console.log("--- subscriptionData ----", subscriptionData);
//   if (subscriptionData)
//     resolve({
//       status: true,
//       message: "User have Subscription",
//     });
//   else
//     rejected({
//       status: false,
//       message: "User does not have Subscription",
//     });
// })();
