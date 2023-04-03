const Video = require("../models/Video");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const History = require("../models/History");
const WatchHistory = require("../models/WatchHistory");
const objectId = require("mongodb").ObjectId;

const { findLocation } = require("../helpers/location");

const createVideo = (obj) => {
  return Video.create(obj);
};

const updateVideo = (id, obj) => {
  return Video.findOneAndUpdate({ _id: id }, { $set: obj }, { new: true });
};
const getFeatureVideos = (id, obj) => {
  return Video.find({ isFeatureVideo: true }, {}, { sort: { createdAt: -1 } })
    .limit(15)
    .populate("userId", "username avatar");
};

const deleteVideo = (id) => {
  return Video.findOneAndDelete({ _id: id });
};

const getAllVideos = async (limit, userId) => {
  const location = await findLocation();
  const watchCategories = await WatchHistory.find({
    userId: new objectId(userId),
  }).select("videosCategory");

  const categories = watchCategories?.map((cate) => cate.videosCategory);

  let uniqueCategories = [...new Set(categories)];
  const videos = await Video.find(
    { $or: [{ category: { $in: uniqueCategories } }, { location: location }] },
    {},
    { sort: { createdAt: -1 } }
  )
    .limit(10)
    .skip(limit)
    .populate("userId", "username avatar");

  if (videos.length === 0) {
    return Video.find({}, {}, { sort: { createdAt: -1 } })
      .limit(10)
      .skip(limit)
      .populate("userId", "username avatar");
  } else return videos;
};

const userVideos = (id) => {
  return Video.find({ userId: id }).populate("userId", "username avatar");
};

const userVideosByRating = (id) => {
  return Video.find(
    { userId: id },
    {},
    { sort: { "reviewPoints.point": -1 } }
  ).populate("userId", "username avatar");
};

const videosByCategory = (obj) => {
  return Video.find(obj, {}, { sort: { createdAt: -1 } }).populate(
    "userId",
    "username firstName lastName avatar"
  );
};

const videosById = async (obj) => {
  return Video.findOne({ _id: obj._id });
};

const relatedWatchVideos = (title, limit) => {
  return Video.find(
    { category: title },
    {}
    // { sort: { createdAt: -1 } }
  )
    .limit(12)
    .skip(limit)
    .populate("userId", "username avatar createdAt realViews");
};

const topViewers = () => {
  return Video.find()
    .lean(true)
    .select("realViews")
    .limit(10000)
    .populate("userId", "username avatar _id rating");
};

const topDownloaders = () => {
  return Video.find()
    .sort({ downloads: -1 })
    .populate("userId", "username avatar _id rating")
    .limit(10);
};

const topShares = () => {
  return Video.find()
    .sort({ share: -1 })
    .populate("userId", "username avatar _id rating")
    .limit(10);
};

const topTrending = () => {
  return Video.find()
    .sort({ realViews: -1 })
    .limit(15)
    .populate("userId", "username avatar _id rating");
};

const searchVideosByTitle = async (title, limit, skipping) => {
  return Video.find(
    { videoTitle: { $regex: "^" + title, $options: "i" } },
    {},
    { sort: { createdAt: -1 } }
  )
    .skip(skipping === 0 ? 10 : skipping)
    .limit(limit === 0 ? 10 : limit)
    .populate("userId", "username email avatar _id");
};

const addSevenTwentyVideo = (id, url) => {
  return Video.findOneAndUpdate(
    { _id: id },
    { $set: { "qualities.sevenTwenty": url } }
  );
};

const addtenEightyVideo = (id, url) => {
  return Video.findOneAndUpdate(
    { _id: id },
    { $set: { "qualities.tenEighty": url } },
    { new: true }
  );
};

const addfourEightyVideo = (id, url) => {
  return Video.findOneAndUpdate(
    { _id: id },
    { $set: { "qualities.fourEighty": url } },
    { new: true }
  );
};

const addthreeSixtyVideo = (id, url) => {
  return Video.findOneAndUpdate(
    { _id: id },
    { $set: { "qualities.threeSixty": url } },
    { new: true }
  );
};

const addtwoFourtyVideo = (id, url) => {
  return Video.findOneAndUpdate(
    { _id: id },
    { $set: { "qualities.twoFourty": url } },
    { new: true }
  );
};

module.exports = {
  createVideo,
  topDownloaders,
  addSevenTwentyVideo,
  addtenEightyVideo,
  addfourEightyVideo,
  addthreeSixtyVideo,
  addfourEightyVideo,
  addtwoFourtyVideo,
  getAllVideos,
  videosByCategory,
  updateVideo,
  videosById,
  relatedWatchVideos,
  userVideos,
  searchVideosByTitle,
  deleteVideo,
  getFeatureVideos,
  topViewers,
  topShares,
  topTrending,
  userVideosByRating,
};

// (async () => {
//   const response = await Video.aggregate([
//     {
//       $match: {
//         _id: new objectId("620c9ce5a7ed426f9e15cb86"),
//       },
//     },
//     {
//       $
//     }
//   ]);

//   console.log(response);
// })();

// (async () => {
//   const response = await Video.aggregate([
//     {
//       $match: {
//         userId: new objectId("620baebb710f5b3a65acca95"),
//       },
//     },
//     {
//       $sort: { "reviewPoints.point": -1 },
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
//               username: 1,
//               avatar: 1,
//             },
//           },
//         ],
//         as: "userData",
//       },
//     },
//   ]);

//   response.forEach((res) => {
//     console.log(res);
//   });
// })();

// (async () => {
//   // const vvv = await Video.aggregate([
//   //   {
//   //     $project: {
//   //       realViews: 1,
//   //       userId: 1,
//   //     },
//   //   },
//   //   // {
//   //   //   $addFields: {
//   //   //     count: { $sum: "$realViews" },
//   //   //   },
//   //   // },
//   //   // {
//   //   //   $group: {
//   //   //     _id: 1,
//   //   //     userId: { $first: "$userId" },
//   //   //     count: { $first: "$count" },
//   //   //   },
//   //   // },
//   //   // { $limit: 1 },
//   // ]);
//
//   // const vvv = await Video.updateMany(
//   //   {},
//   //   { $unset: { comments: "" } },
//   //   (err, doc) => {
//   //     if (err) console.log(err);
//   //     else {
//   //       console.log(doc);
//   //     }
//   //   }
//   // );
//
//   // vvv.forEach((item, i) => {
//   //   if (item.comments.length > 0) {
//   //     console.log(item);
//   //   }
//   // });
//
//   // const vvv = await Video.find({}, {}).select("realViews").limit(10000);
//   console.log("--------  vvv -----", vvv.length);
// })();
