const Subscription = require("../../models/Subscription");
const objectId = require("mongodb").ObjectId;
const { errorName } = require("../error/constants");

module.exports = {
  getPremierUser: async ({ userId }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) return new Error(errorName.BAD_REQUEST);
      else {
        const premiumUsers = await Subscription.find(
          {
            subscribedTo: new objectId(user.id),
          },
          { _id: 0, updatedAt: 0, valid: 0, subscribedTo: 0 }
        ).populate("subscribedBy", "firstName lastName avatar");

        if (premiumUsers.length > 0) return premiumUsers;
        else return [];
      }
    } catch (error) {
      console.trace("Error in Fetching Premium Users");
      console.log(error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};

// (async () => {
//   const premiumUsers = await Subscription.find(
//     {
//       subscribedTo: new objectId("620bae49710f5b3a65acc898"),
//       valid: true,
//     },
//     { _id: 0, updatedAt: 0, valid: 0, subscribedTo: 0 }
//   ).populate("subscribedBy", "firstName lastName avatar");

//   console.log("Working");
//   console.log(premiumUsers);
// })();
