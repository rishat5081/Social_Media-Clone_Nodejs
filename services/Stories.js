const Story = require("../models/Stories");
const User = require("../models/User");
const StoryViews = require("../models/StoryViews");

const objectId = require("mongodb").ObjectId;
module.exports = {
  getAllFollowingStories: (followingList, user__id) => {
    return new Promise(async (resolve, rejected) => {
      try {
        resolve(
          await User.aggregate([
            {
              $match: {
                _id: { $in: followingList },
              },
            },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
              },
            },
            {
              $lookup: {
                from: "stories",
                let: { user_Id: { $toObjectId: "$_id" } },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$userId", "$$user_Id"],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      views: 1,
                      share: 1,
                      isExpire: 1,
                      userId: 1,
                      caption: 1,
                      typeOfFile: 1,
                      storyURL: 1,
                      thumbnail: 1,
                      createdAt: 1,
                      updatedAt: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "storyviews",
                      let: { storyId: { $toObjectId: "$_id" } },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: ["$userId", new objectId(user__id)],
                                },
                                {
                                  $eq: ["$storyId", "$$storyId"],
                                },
                              ],
                            },
                          },
                        },
                        {
                          $project: {
                            view: 1,
                          },
                        },
                      ],
                      as: "storiesViews",
                    },
                  },
                ],
                as: "stories",
              },
            },
          ])
          // await Story.find({ userId: { $in: followingList } }).populate(
          //   "userId",
          //   "username avatar"
          // )
        );
      } catch (e) {
        if (e) {
          rejected(null);
        }
      }
    });
  },
  getStoriesByLimit: (limit, offset) => {
    return new Promise(async (resolve, rejected) => {
      try {
        resolve(
          await Story.find()
            .skip(offset)
            .limit(limit)
            .populate("userId", "username avatar")
        );
      } catch (e) {
        if (e) {
          rejected(null);
        }
      }
    });
  },
  getStoryViewers: async (userId, storyId) => {
    try {
      return new Promise(async (resolve, rejected) => {
        const viewers = await StoryViews.aggregate([
          {
            $match: {
              storyId: new objectId(storyId),
            },
          },
          {
            $project: {
              _id: 1,
              userId: 1,
            },
          },
          {
            $lookup: {
              from: "users",
              let: { user__id: { $toObjectId: "$userId" } },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$user__id"],
                    },
                  },
                },
                {
                  $project: {
                    _id: 1,
                    avatar: 1,
                    username: 1,
                    firstName: 1,
                  },
                },
              ],
              as: "user",
            },
          },
        ]);

        if (viewers) resolve(viewers);
        else rejected(null);
      });
    } catch (e) {
      console.log("Error Getting the Viewers from the Database");
      console.trace(e);
      return null;
    }
  },
};

// (async () => {
//   const allStories = await User.aggregate([
//     {
//       $match: {
//         _id: new objectId("623d7298100c5b1ce9b05735")
//       }
//     },
//     {
//       $project: {
//         _id: 1,
//         firstName: 1,
//         lastName: 1,
//         avatar: 1
//       }
//     },
//     {
//       $lookup: {
//         from: "stories",
//         let: { user_Id: { $toObjectId: "$_id" } },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                  $eq: ["$userId", "$$user_Id"]
//               }
//             }
//           }
//         ],
//         as: "stories"
//       }
//     }
//   ]);
//
//   console.log("allStories", allStories);
// })();
