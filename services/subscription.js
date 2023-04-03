const Video = require("../models/Video");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const objectId = require("mongodb").ObjectId;

module.exports = {
  getAllSubscribedVideos: async userId => {
    try {
      if (!(userId && subscribedTo)) {
        console.log(" ------- Error Get All Subscribed Videos ------- ");
        return {
          status: null,
          message: "Invalid Ids are provided"
        };
      } else {
        const checkSubscription = await Subscription.findOne({
          // subscribedTo: new objectId(subscribedTo),
          subscribedBy: new objectId(userId),
          valid: true
        });
        if (checkSubscription?._id) {
          const subscribedVideos = await Video.find({
            userId: new objectId(checkSubscription?.subscribedTo)
          }).populate("userId", "avatar username firstName lastName");

          return subscribedVideos;
        } else {
          return {
            status: null,
            message: "You are not subscribed to this User"
          };
        }
      }
    } catch (e) {
      console.log("Error in Getting the Subscribed Videos");
      console.trace(e);
      return {
        status: null,
        message: "Invalid Ids are provided"
      };
    }
  }
};
