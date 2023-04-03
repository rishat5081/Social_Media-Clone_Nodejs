const Article = require("../../models/Article");
// const WatchHistory = require("../../models/WatchHistory");
// const WatchTimeofVideo = require("../../models/WatchTimeofVideo");
// const { findLocation } = require("../../helpers/location");
const objectId = require("mongodb").ObjectId;

// User.updateMany(
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
  updateArticle: async (req, res) => {
    try {
      const {
        articleId,
        theArticle,
        title,
        tags,
        category,
        imageUrl,
        description,
      } = req.body;

      if (!articleId) {
        res.status(404).send({
          status: false,
          message: "Article Id is required",
        });
        res.end();
        return;
      }
      const article = await Article.findOne({
        _id: new objectId(articleId),
      });

      if (article?._id) {
        const update = await Article.updateOne(
          { _id: articleId },
          {
            $set: {
              theArticle,
              title,
              tags,
              category,
              imageUrl,
              description,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Article Updated",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Article",
          });
          res.end();
          return;
        }
      } else {
        res.status(404).send({
          status: false,
          message: "No Article Found with this Article Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Article");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
  deleteArticle: async (req, res) => {
    try {
      const { articleId } = req.query;

      if (!articleId) {
        res.status(404).send({
          status: false,
          message: "articleId is required",
        });
        res.end();
        return;
      }
      const video = await Article.findOne({
        _id: new objectId(articleId),
      });

      if (video?._id) {
        const update = await Article.updateOne(
          { _id: articleId },
          {
            $set: {
              deleted: true,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Article Deleted",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Article",
          });
          res.end();
          return;
        }
      } else {
        res.status(404).send({
          status: false,
          message: "No Article Found with this Article Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Article");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
};

// getRecommendedVideos: async (req, res) => {
//   try {
//     let { userId } = req.query;
//     console.log(userId, "  ----");
//     let uniqueCategories = [];
//     if (userId) {
//       const watchCategories = await WatchHistory.find({
//         userId: new objectId(userId),
//       }).select("videosCategory");
//
//       const categories = watchCategories?.map((cate) => cate.videosCategory);
//
//       uniqueCategories = [...new Set(categories)];
//     } else {
//       uniqueCategories = [
//         "Film Animation",
//         "Music",
//         "Sports",
//         "Gaming",
//         "Pets and Animals",
//         "Travel and Events",
//         "People Blogs",
//         "Comedy",
//         "Entertainment",
//         "News and Politics",
//         "How-to and Style",
//         "Non-profits and Activism",
//         "Pranks",
//         "Trailers",
//         "Food",
//         "Motivational",
//         "HowTo & Style",
//         "Gaming",
//         "HUM TV dramas",
//         "Funny",
//         "HUM TV dramas",
//         "Nature",
//         "Fashion",
//         "Kids",
//         "Cars",
//         "Decoration",
//         "Technology",
//         "Motivation",
//         "Dancing",
//         "Other",
//       ];
//     }
//
//     const videoFromDb = await Video.aggregate([
//       {
//         $match: {
//           category: { $in: uniqueCategories },
//           deleted: false,
//         },
//       },
//       {
//         $project: {
//           qualities: 0,
//           comments: 0,
//           __v: 0,
//           privacy: 0,
//           ageRestriction: 0,
//           tags: 0,
//           price: 0,
//           profileViews: 0,
//           isPremier: 0,
//           location: 0,
//         },
//       },
//       {
//         $limit: 15,
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$_id", "$$userId"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 avatar: 1,
//                 username: 1,
//                 firstName: 1,
//                 email: 1,
//                 lastName: 1,
//               },
//             },
//           ],
//           as: "userId",
//         },
//       },
//       {
//         $lookup: {
//           from: "videocomments",
//           let: { videoId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $or: [
//                   {
//                     $expr: {
//                       $eq: ["$videoId", "$$videoId"],
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//               },
//             },
//           ],
//           as: "comments",
//         },
//       },
//       //total likes
//       {
//         $addFields: {
//           commentCount: { $size: "$comments" },
//         },
//       },
//       //total RepliesOfComments
//       {
//         $unwind: {
//           path: "$reviewPoints",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $addFields: {
//           average_rating: { $avg: "$reviewPoints.point" },
//         },
//       },
//       // {
//       //   $group: {
//       //     _id: "$_id",
//       //     videoTitle: { $first: "$videoTitle" },
//       //     realViews: { $first: "$realViews" },
//       //     thumbnail: { $first: "$thumbnail" },
//       //     category: { $first: "$category" },
//       //     share: { $first: "$share" },
//       //     average_rating: { $avg: "$reviewPoints.point" },
//       //     avatar: { $first: "$avatar" },
//       //     createdAt: { $first: "$createdAt" },
//       //     isPremier: { $first: "$isPremier" },
//       //     isPaid: { $first: "$isPaid" },
//       //     priceOfVideo: { $first: "$priceOfVideo" },
//       //     downloads: { $first: "$downloads" },
//       //     ageRestriction: { $first: "$ageRestriction" },
//       //     tags: { $first: "$tags" },
//       //     userId: { $first: "$userId" },
//       //     isFeatureVideo: { $first: "$isFeatureVideo" },
//       //     commentCount: { $first: "$commentCount" },
//       //   },
//       // },
//     ]);
//     if (videoFromDb.length > 0) {
//       for (var variable of videoFromDb) {
//         variable.userId = variable.userId[0];
//         delete variable.comments;
//       }
//       // const aaa =
//       res.status(200).send({ status: true, videoFromDb });
//       res.end();
//       return;
//     } else {
//       res.status(200).send({ status: false, message: "No Videos Found" });
//       res.end();
//       return;
//     }
//   } catch (e) {
//     if (e) {
//       console.log(e);
//       res.status(404).send({ status: false, message: e.message });
//       res.end();
//       return;
//     }
//   }
// },
// getVideosByLocation: async (req, res) => {
//   try {
//     const location = await findLocation();
//     const videoFromDb = await Video.aggregate([
//       {
//         $match: {
//           location: location,
//           deleted: false,
//         },
//       },
//       {
//         $limit: 15,
//       },
//       {
//         $project: {
//           qualities: 0,
//           comments: 0,
//           __v: 0,
//           privacy: 0,
//           ageRestriction: 0,
//           tags: 0,
//           price: 0,
//           profileViews: 0,
//           isPremier: 0,
//           location: 0,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$_id", "$$userId"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 avatar: 1,
//                 username: 1,
//               },
//             },
//           ],
//           as: "userId",
//         },
//       },
//       {
//         $lookup: {
//           from: "videocomments",
//           let: { videoId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $or: [
//                   {
//                     $expr: {
//                       $eq: ["$videoId", "$$videoId"],
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//               },
//             },
//           ],
//           as: "comments",
//         },
//       },
//
//       //total likes
//       {
//         $addFields: {
//           commentCount: { $size: "$comments" },
//         },
//       },
//       {
//         $unwind: {
//           path: "$reviewPoints",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $addFields: {
//           average_rating: { $avg: "$reviewPoints.point" },
//         },
//       },
//     ]);
//
//     if (videoFromDb.length > 0) {
//       for (var variable of videoFromDb) {
//         variable.userId = variable.userId[0];
//         delete variable.comments;
//       }
//       res.status(200).send({ status: true, videoFromDb });
//       res.end();
//       return;
//     } else {
//       res.status(200).send({ status: false, message: "No Videos Found" });
//       res.end();
//       return;
//     }
//   } catch (e) {
//     if (e) {
//       res.status(404).send({ status: false, message: e.message });
//       res.end();
//       return;
//     }
//   }
// },
// getAllVideos: async (req, res) => {
//   try {
//     const videoFromDb = await Video.aggregate([
//       {
//         $match: {
//           deleted: false,
//         },
//       },
//       {
//         $project: {
//           qualities: 0,
//           comments: 0,
//           __v: 0,
//           privacy: 0,
//           ageRestriction: 0,
//           tags: 0,
//           price: 0,
//           profileViews: 0,
//           isPremier: 0,
//           location: 0,
//         },
//       },
//       {
//         $limit: 100,
//       },
//       {
//         $lookup: {
//           from: "users",
//           let: { userId: "$userId" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $eq: ["$_id", "$$userId"],
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//                 avatar: 1,
//                 username: 1,
//               },
//             },
//           ],
//           as: "userId",
//         },
//       },
//       {
//         $lookup: {
//           from: "videocomments",
//           let: { videoId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $or: [
//                   {
//                     $expr: {
//                       $eq: ["$videoId", "$$videoId"],
//                     },
//                   },
//                 ],
//               },
//             },
//             {
//               $project: {
//                 _id: 1,
//               },
//             },
//           ],
//           as: "comments",
//         },
//       },
//       //total likes
//       {
//         $addFields: {
//           commentCount: { $size: "$comments" },
//         },
//       },
//       {
//         $unwind: {
//           path: "$reviewPoints",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $addFields: {
//           average_rating: { $avg: "$reviewPoints.point" },
//         },
//       },
//
//       {
//         $sort: { createdAt: -1 },
//       },
//     ]);
//
//     if (videoFromDb.length > 0) {
//       for (var variable of videoFromDb) {
//         variable.userId = variable.userId[0];
//         delete variable.comments;
//       }
//       res.status(200).send({ status: true, videoFromDb });
//       res.end();
//       return;
//     } else {
//       res.status(200).send({ status: false, message: "No Videos Found" });
//       res.end();
//       return;
//     }
//   } catch (e) {
//     if (e) {
//       res.status(404).send({ status: false, message: e.message });
//       res.end();
//       return;
//     }
//   }
// },
// addWatchTimeofVideo: async (req, res) => {
//   try {
//     let { userId, videoId, watchTime } = req.body;
//     console.log(
//       "req.connection.remoteAddress ",
//       req.connection.remoteAddress
//     );
//     if (!(videoId && watchTime)) {
//       res
//         .status(400)
//         .send({ status: false, message: "VideoId && WatchTime" });
//       res.end();
//       return;
//     } else {
//       const watchTimeofVideo = await WatchTimeofVideo.findOne({
//         userId,
//         videoId: new objectId(videoId),
//         ipAddress: req.connection.remoteAddress.toString(),
//       });
//
//       console.log("watchTimeofVideo ", watchTimeofVideo);
//       if (watchTimeofVideo?._id) {
//         res.status(200).send({
//           status: false,
//           message: "Watch Time is already present against this video",
//         });
//         res.end();
//         return;
//       } else {
//         const createWatchTime = await WatchTimeofVideo.create({
//           userId:
//             userId === "------------------------" ? "" : new objectId(userId),
//           videoId: new objectId(videoId),
//           time: parseFloat(watchTime),
//           ipAddress: req.connection.remoteAddress,
//         });
//
//         if (createWatchTime?._id) {
//           res
//             .status(200)
//             .send({ status: true, message: "WatchTime is added" });
//           res.end();
//           return;
//         }
//       }
//     }
//   } catch (e) {
//     console.log("Error Occur on adding Watch Time of the Video");
//     console.trace(e);
//     res.status(404).send({ status: false, message: e.message });
//     res.end();
//     return;
//   }
// },
