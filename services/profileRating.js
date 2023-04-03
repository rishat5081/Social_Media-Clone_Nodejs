const ProfileRating = require("../models/ProfileRating");
const objectId = require("mongodb").ObjectId;
module.exports = {
  getProfileRatingById: (profileRatedTo, profileRatedBy) => {
    return ProfileRating.findOne({
      profileRatedTo,
      profileRatedBy,
    });
  },
  addProfileRating: (profileRatedTo, profileRatedBy, rating) => {
    return ProfileRating.create({ profileRatedTo, profileRatedBy, rating });
  },

  updateProfileRating: async (profileRatedTo, profileRatedBy, rating) => {
    return ProfileRating.updateOne(
      { profileRatedTo: profileRatedTo, profileRatedBy: profileRatedBy },
      { $set: { rating: rating } },
      { new: true }
    );
  },
  getUserRating: async (userId) => {
    return ProfileRating.aggregate([
      {
        $match: {
          profileRatedTo: new objectId(userId),
        },
      },
      {
        $project: {
          profileRatedTo: 1,
          rating: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
  },
};

/**
 *
 *
 *
 *
 *
 *
 *
 *
 */
// (async () => {
//   const query = [
//     {
//       $match: {
//         profileRatedTo: new objectId("620bae49710f5b3a65acc899"),
//       },
//     },
//     {
//       $project: {
//         profileRatedTo: 1,
//         rating: 1,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalAmount: { $sum: "$rating" },
//         count: { $sum: 1 },
//       },
//     },
//   ];
//   const response = await ProfileRating.aggregate(query);

//   console.log("response ::", response);
// })();
