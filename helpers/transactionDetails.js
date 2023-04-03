const TransactionDetail = require("../models/TransactionDetail");

module.exports = {
  getEarningInfo: async (userId) => {
    return TransactionDetail.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $project: {
          totalAmount: 1,
          videoId: 1,
          payerId: 1,
          createdAt: 1,
          totalAmount: 1,
          creditAomunt: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            users_Id: { $toObjectId: "$payerId" },
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
      {
        $lookup: {
          from: "videos",
          let: {
            video_Id: { $toObjectId: "$videoId" },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$video_Id"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                videoTitle: 1,
              },
            },
          ],
          as: "videoData",
        },
      },
    ]);
  },
};
