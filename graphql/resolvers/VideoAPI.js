const Video = require("../../models/Video");
const WatchHistory = require("../../models/WatchHistory");
const WatchTimeofVideo = require("../../models/WatchTimeofVideo");
const { findLocation } = require("../../helpers/location");
const objectId = require("mongodb").ObjectId;

// Video.updateMany(
//   {},
//   {
//     $set: {
//       deleted: false,
//     },
//   },
//   (err, res) => {
//     if (err) console.log(err);
//
//     console.log(res);
//   }
// );
module.exports = {
  getRecommendedVideos: async (req, res) => {
    try {
      let { userId } = req.query;
      let uniqueCategories = [];
      if (userId) {
        const watchCategories = await WatchHistory.find({
          userId: new objectId(userId),
        }).select("videosCategory");

        const categories = watchCategories?.map((cate) => cate.videosCategory);

        uniqueCategories = [...new Set(categories)];
      } else {
        uniqueCategories = [
          "Film Animation",
          "Music",
          "Sports",
          "Gaming",
          "Pets and Animals",
          "Travel and Events",
          "People Blogs",
          "Comedy",
          "Entertainment",
          "News and Politics",
          "How-to and Style",
          "Non-profits and Activism",
          "Pranks",
          "Trailers",
          "Food",
          "Motivational",
          "HowTo & Style",
          "Gaming",
          "HUM TV dramas",
          "Funny",
          "HUM TV dramas",
          "Nature",
          "Fashion",
          "Kids",
          "Cars",
          "Decoration",
          "Technology",
          "Motivation",
          "Dancing",
          "Other",
        ];
      }

      const videoFromDb = await Video.aggregate([
        {
          $match: {
            category: { $in: uniqueCategories },
            deleted: false,
          },
        },
        {
          $project: {
            qualities: 0,
            comments: 0,
            __v: 0,
            privacy: 0,
            ageRestriction: 0,
            tags: 0,
            price: 0,
            profileViews: 0,
            isPremier: 0,
            location: 0,
            deleted: 0,
          },
        },
        {
          $limit: 15,
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  avatar: 1,
                  username: 1,
                  firstName: 1,
                  email: 1,
                  lastName: 1,
                },
              },
            ],
            as: "userId",
          },
        },
        {
          $lookup: {
            from: "videocomments",
            let: { videoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr: {
                        $eq: ["$videoId", "$$videoId"],
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: "comments",
          },
        },
        //total likes
        {
          $addFields: {
            commentCount: { $size: "$comments" },
          },
        },
        //total RepliesOfComments
        {
          $unwind: {
            path: "$reviewPoints",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            average_rating: { $avg: "$reviewPoints.point" },
          },
        },
        // {
        //   $group: {
        //     _id: "$_id",
        //     videoTitle: { $first: "$videoTitle" },
        //     realViews: { $first: "$realViews" },
        //     thumbnail: { $first: "$thumbnail" },
        //     category: { $first: "$category" },
        //     share: { $first: "$share" },
        //     average_rating: { $avg: "$reviewPoints.point" },
        //     avatar: { $first: "$avatar" },
        //     createdAt: { $first: "$createdAt" },
        //     isPremier: { $first: "$isPremier" },
        //     isPaid: { $first: "$isPaid" },
        //     priceOfVideo: { $first: "$priceOfVideo" },
        //     downloads: { $first: "$downloads" },
        //     ageRestriction: { $first: "$ageRestriction" },
        //     tags: { $first: "$tags" },
        //     userId: { $first: "$userId" },
        //     isFeatureVideo: { $first: "$isFeatureVideo" },
        //     commentCount: { $first: "$commentCount" },
        //   },
        // },
      ]);
      if (videoFromDb.length > 0) {
        for (var variable of videoFromDb) {
          variable.userId = variable.userId[0];
          delete variable.comments;
        }

        res.status(200).send({ status: true, videoFromDb });
        res.end();
        return;
      } else {
        res.status(200).send({ status: false, message: "No Videos Found" });
        res.end();
        return;
      }
    } catch (e) {
      if (e) {
        console.log(e);
        res.status(404).send({ status: false, message: e.message });
        res.end();
        return;
      }
    }
  },
  getVideosByLocation: async (req, res) => {
    try {
      const location = await findLocation();
      const videoFromDb = await Video.aggregate([
        {
          $match: {
            location: location,
            deleted: false,
          },
        },
        {
          $limit: 15,
        },
        {
          $project: {
            qualities: 0,
            comments: 0,
            __v: 0,
            privacy: 0,
            ageRestriction: 0,
            tags: 0,
            price: 0,
            profileViews: 0,
            isPremier: 0,
            location: 0,
            deleted: 0,
          },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"],
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
            as: "userId",
          },
        },
        {
          $lookup: {
            from: "videocomments",
            let: { videoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr: {
                        $eq: ["$videoId", "$$videoId"],
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: "comments",
          },
        },

        //total likes
        {
          $addFields: {
            commentCount: { $size: "$comments" },
          },
        },
        {
          $unwind: {
            path: "$reviewPoints",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            average_rating: { $avg: "$reviewPoints.point" },
          },
        },
      ]);

      if (videoFromDb.length > 0) {
        for (var variable of videoFromDb) {
          variable.userId = variable.userId[0];
          delete variable.comments;
        }
        res.status(200).send({ status: true, videoFromDb });
        res.end();
        return;
      } else {
        res.status(200).send({ status: false, message: "No Videos Found" });
        res.end();
        return;
      }
    } catch (e) {
      if (e) {
        res.status(404).send({ status: false, message: e.message });
        res.end();
        return;
      }
    }
  },
  getAllVideos: async (req, res) => {
    try {
      const videoFromDb = await Video.aggregate([
        {
          $match: {
            deleted: false,
          },
        },
        {
          $project: {
            qualities: 0,
            comments: 0,
            __v: 0,
            privacy: 0,
            ageRestriction: 0,
            tags: 0,
            price: 0,
            profileViews: 0,
            isPremier: 0,
            location: 0,
            deleted: 0,
          },
        },
        {
          $limit: 100,
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$userId"],
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
            as: "userId",
          },
        },
        {
          $lookup: {
            from: "videocomments",
            let: { videoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $or: [
                    {
                      $expr: {
                        $eq: ["$videoId", "$$videoId"],
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: "comments",
          },
        },
        //total likes
        {
          $addFields: {
            commentCount: { $size: "$comments" },
          },
        },
        {
          $unwind: {
            path: "$reviewPoints",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            average_rating: { $avg: "$reviewPoints.point" },
          },
        },

        {
          $sort: { createdAt: -1 },
        },
      ]);

      if (videoFromDb.length > 0) {
        for (var variable of videoFromDb) {
          variable.userId = variable.userId[0];
          delete variable.comments;
        }
        res.status(200).send({ status: true, videoFromDb });
        res.end();
        return;
      } else {
        res.status(200).send({ status: false, message: "No Videos Found" });
        res.end();
        return;
      }
    } catch (e) {
      if (e) {
        res.status(404).send({ status: false, message: e.message });
        res.end();
        return;
      }
    }
  },
  addWatchTimeofVideo: async (req, res) => {
    try {
      let { userId, videoId, watchTime, creatorId } = req.body;
      console.log(
        "req.connection.remoteAddress ",
        req.connection.remoteAddress
      );
      if (!(videoId && watchTime && creatorId)) {
        res.status(400).send({
          status: false,
          message: "VideoId && WatchTime && creatorId is reqiured",
        });
        res.end();
        return;
      } else {
        const watchTimeofVideo = await WatchTimeofVideo.findOne({
          userId,
          videoId: new objectId(videoId),
          ipAddress: req.connection.remoteAddress.toString(),
        });

        // console.log("watchTimeofVideo ", watchTimeofVideo);
        if (watchTimeofVideo?._id) {
          res.status(200).send({
            status: false,
            message: "Watch Time is already present against this video",
          });
          res.end();
          return;
        } else {
          const createWatchTime = await WatchTimeofVideo.create({
            userId:
              userId === "------------------------" ? "" : new objectId(userId),
            videoId: new objectId(videoId),
            time: parseFloat(watchTime),
            ipAddress: req.connection.remoteAddress,
            creatorId: new objectId(creatorId),
          });

          if (createWatchTime?._id) {
            res
              .status(200)
              .send({ status: true, message: "WatchTime is added" });
            res.end();
            return;
          }
        }
      }
    } catch (e) {
      console.log("Error Occur on adding Watch Time of the Video");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
  updateVideo: async (req, res) => {
    try {
      const {
        videoId,
        privacy,
        ageRestriction,
        tags,
        price,
        videoTitle,
        videoDescription,
        category,
        isFeatureVideo,
        isPremier,
        isPaid,
        priceOfVideo,
      } = req.body;

      if (!videoId) {
        res.status(404).send({
          status: false,
          message: "videoId is required",
        });
        res.end();
        return;
      }
      const video = await Video.findOne({
        _id: new objectId(videoId),
      });

      if (video?._id) {
        const update = await Video.updateOne(
          { _id: videoId },
          {
            $set: {
              privacy,
              ageRestriction,
              tags,
              price,
              videoTitle,
              videoDescription,
              category,
              isFeatureVideo,
              isPremier,
              isPaid,
              priceOfVideo,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Video Updated",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Video",
          });
          res.end();
          return;
        }
      } else {
        res.status(404).send({
          status: false,
          message: "No Video Found with this Video Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Video");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
  deleteVideo: async (req, res) => {
    try {
      const { videoId } = req.query;

      if (!videoId) {
        res.status(404).send({
          status: false,
          message: "videoId is required",
        });
        res.end();
        return;
      }
      const video = await Video.findOne({
        _id: new objectId(videoId),
      });

      if (video?._id) {
        const update = await Video.updateOne(
          { _id: videoId },
          {
            $set: {
              deleted: true,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Video Deleted",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Video",
          });
          res.end();
          return;
        }
      } else {
        res.status(400).send({
          status: false,
          message: "No Video Found with this Video Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Video");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
};
