const Subscription = require("../../models/Subscription");
const Video = require("../../models/Video");
const objectId = require("mongodb").ObjectId;
const { errorName } = require("../error/constants");
const { getAllSubscribedVideos } = require("../../services/subscription");
const {
  chargeFromStripe,
  successTransactionFromStripe,
  createCustomer,
  createSubscription,
  checkSubscriptionofUser,
} = require("../../helpers/subscription");

const subscriptionProducts = {
  VyzmoPackage1: "price_1KbgDHKw8NlufAejeGrWE76n",
  amount: 100,
};
module.exports = {
  getPremiumVideo: async (req, res) => {
    try {
      const userId = req.query.userId;
      const premiumVideos = await Video.find({
        userId,
        isPremier: true,
      }).populate("userId", "avatar username firstName");

      if (premiumVideos.length > 0) {
        res.status(200).send({ premiumVideos });
        res.end();
        return;
      } else {
        res.status(200).send({ premiumVideos: [] });
        res.end();
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(404).send({ message: "Error Getting Premium Videos", error });
      res.end();
      return;
    }
  },
  // getPremiumVideo: async (req, res) => {
  //   try {
  //     const userId = req.user.id;
  //     const premiumVideos = await Video.find({
  //       userId,
  //       isPremier: true
  //     }).populate("userId", "avatar username firstName");
  //
  //     if (premiumVideos.length > 0) {
  //       res.status(200).send({ premiumVideos });
  //       res.end();
  //       return;
  //     } else {
  //       res.status(200).send({ premiumVideos: [] });
  //       res.end();
  //       return;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     res.status(404).send({ message: "Error Getting Premium Videos" });
  //     res.end();
  //     return;
  //   }
  // },
  subscribeUser: async (req, res) => {
    try {
      let user = req.user.id;
      let { subscribeTo, subscribeBy, email, paymentID } = req.body;

      // let user = {};
      // user.id = "620baeb8710f5b3a65acca84";
      if (!(user && subscribeTo && subscribeBy && email && paymentID)) {
        res.status(400).send({
          message:
            "User && Subscribed To && Subscribed By && Email && PaymentID is required",
        });
        res.end();
        return;
      } else {
        const stripeUserCreated = await createCustomer(email, paymentID);
        // const stripeUserAttachedPayment = await attachPaymentMethod_Customer(
        //   stripeUserCreated,
        //   paymentID
        // );
        const subcriptionUser = await createSubscription(
          stripeUserCreated,
          subscriptionProducts.VyzmoPackage1
        );
        const saveTransaction = await successTransactionFromStripe(
          subscribeTo,
          subcriptionUser,
          subscribeBy,
          "Stripe",
          "Success",
          subscriptionProducts.amount
        );
        /***
         *
         *
         *
         *
         *
         *
         *
         */
        const subscribeTheUser = await Subscription.create({
          subscribedTo: new objectId(subscribeTo.toString()),
          subscribedBy: new objectId(subscribeBy.toString()),
          subcriptionKey: subcriptionUser,
          customerKey: stripeUserCreated,
        });
        subscribeTheUser.save();

        if (subscribeTheUser) {
          res
            .status(200)
            .send({ status: true, message: "Subscription is done" });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Creating new Subscription",
            error,
          });
          res.end();
          return;
        }
      }
    } catch (error) {
      console.log(error);
      res.status(404).send({ message: "Error Creating new Subscription" });
      res.end();
      return;
    }
  },
  checkSubscription: async (req, res) => {
    try {
      let user = req.user.id;
      let { userId } = req.body;

      console.log(req.body);
      if (!user) {
        res.status(400).send({ message: "UserId is required" });
        res.end();
        return;
      } else {
        console.log("---- user -----", user);
        console.log("---- userId -----", userId);
        const subscriptionStatus = await checkSubscriptionofUser(
          user,
          userId
        ).catch((err) => {
          if (err) return err;
        });
        console.log("subscriptionStatus", subscriptionStatus);
        if (subscriptionStatus.status) {
          res
            .status(200)
            .send({ status: true, message: subscriptionStatus.message });
          res.end();
          return;
        } else {
          res
            .status(200)
            .send({ status: false, message: subscriptionStatus.message });
          res.end();
          return;
        }
      }
    } catch (error) {
      console.error("Error in checking Subcruption", error);
      res
        .status(404)
        .send({ message: "Error Creating new Subscription", error });
      res.end();
      return;
    }
  },
  getSubscribedVideos: async (req, res) => {
    try {
      const userId = req.user.id;
      // const { subscribeTo } = req.body;
      if (!userId) {
        res.status(400).send({ message: "User Id is required" });
        res.end();
        return;
      } else {
        const videos = await getAllSubscribedVideos(userId);
        if (videos) {
          res.status(200).send({ videos });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("Error Getting the Subscribed Videos");
      console.trace(e);
      res.status(404).send({ message: "User Id is required" });
      res.end();
      return;
    }
  },
};
