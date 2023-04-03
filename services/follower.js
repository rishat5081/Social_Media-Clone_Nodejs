const Follower = require("../models/Follower");
const objectId = require("mongodb").ObjectId;
module.exports = {
  createFollower: (user) => {
    return Follower.create(user);
  },
  getFollowerDocById: (id) => {
    return Follower.findOne({ userId: id })
      .populate("userId")
      .populate("followBy.userId")
      .populate("followTo.userId", "username avatar _id rating");
  },
  getAllUserFollowers: (id) => {
    return Follower.findOne({ userId: id })
      .populate("followBy.userId", "id username firstName lastName avatar")
      .populate("followTo.userId", "id username firstName lastName avatar");
  },
  topFollwers: () => {
    return Follower.aggregate([
      {
        $sort: { followers: -1 },
      },
      {
        $project: {
          userId: 1,
          followers: 1,
        },
      },
      {
        $limit: 50,
      },
      {
        $lookup: {
          from: "users",
          let: { users_Id: { $toObjectId: "$userId" } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$users_Id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
          as: "users",
        },
      },
    ]);

    // return Follower.find()
    //   .sort({ followers: -1 })
    //   .populate("userId", "username avatar _id rating")
    //   .limit(10);
    // return Video.find({$text: {$search: title}})
  },
  getFollowersByUserIds: (ids) => {
    return Follower.find({ userId: { $in: [...ids] } });
  },
  getUserFollower: (id) => {
    return Follower.findOne({ userId: new objectId(id) });
  },
  getAllFollowingList: async (id) => {
    const followers = await Follower.aggregate([
      {
        $match: {
          userId: new objectId(id),
        },
      },
      {
        $project: {
          followTo: 1,
          userId: 1,
        },
      },
    ]);

    if (followers.length > 0) {
      return followers.flatMap(({ id, followTo }) =>
        followTo.map((follow) => follow.userId)
      );
    }
  },
  getAllFollowing: (id) => {
    return Follower.aggregate([
      {
        $match: {
          userId: new objectId(id),
        },
      },
      {
        $project: {
          followTo: 1,
          userId: 1,
        },
      },
      {
        $unwind: {
          path: "$followTo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            users_Id: { $toObjectId: "$followTo.userId" },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$users_Id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                avatar: 1,
                username: 1,
              },
            },
          ],
          as: "userData",
        },
      },
    ]);
  },
};

// (async () => {
//   const follwers = await Follower.aggregate([
//     {
//       $match: {
//         "followTo.userId": new objectId("620baebb710f5b3a65acca95"),
//       },
//     },
//     {
//       $project: {
//         userId: 1,
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: {
//           users_Id: { $toObjectId: "$userId" },
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ["$_id", "$$users_Id"],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               avatar: 1,
//               username: 1,
//             },
//           },
//         ],
//         as: "userData",
//       },
//     },
//   ]);

//   follwers.forEach((ffff) => {
//     console.log("Follower ::", ffff.userData);
//   });
// })();
