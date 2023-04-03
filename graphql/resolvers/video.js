const { AwaitVariablesLink } = require("graphql-tools");
const History = require("../../models/History");
const Video = require("../../models/Video");
const Playlist = require("../../models/Playlist");
const Subscription = require("../../models/Subscription");
const objectId = require("mongodb").ObjectId;
const { getUserFollower } = require("../../services/follower");
const { getUserByIdforVideo, getUserById } = require("../../services/user");
const {
  getAllVideos,
  videosByCategory,
  searchVideosByTitle,
  videosById,
  updateVideo,
  relatedWatchVideos,
  userVideos,
  deleteVideo,
  getFeatureVideos,
  topViewers,
  topDownloaders,
  topShares,
  userVideosByRating,
  topTrending,
} = require("../../services/video");
const filterTop = require("../../utils/topUsersFilter");
const { errorName } = require("../error/constants");
const _ = require("lodash");
const { videoAverageRating } = require("../../utils/averageRating");
const Notification = require("../../models/Notification");
const WatchHistory = require("../../models/WatchHistory");
const VideoLikes = require("../../models/VideoLikes");

module.exports = {
  uploadVideo: async (parent, args, ctx) => {
    try {
      return "Ok Video";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  videos: async ({ limit }, ctx) => {
    try {
      let { user } = ctx;
      let allVideos = await getAllVideos(
        limit,
        user?.id ? user?.id : "------------"
      );
      for (let i = 0; i < allVideos.length; i++) {
        let averageRating = videoAverageRating(allVideos[i]);
        allVideos[i].average_rating = averageRating;
      }

      return allVideos;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  videosByCategory: async ({ category }, ctx) => {
    try {
      let allVideos = await videosByCategory({ category: category });
      for (let i = 0; i < allVideos.length; i++) {
        let averageRating = videoAverageRating(allVideos[i]);
        allVideos[i].average_rating = averageRating;
      }
      return allVideos;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  videoById: async ({ id }, ctx) => {
    try {
      let { user } = ctx;

      if (!user) user_Id = "------------";
      else user_Id = user.id;
      const videoFromDb = await Video.aggregate([
        {
          $match: {
            _id: new objectId(id),
          },
        },
        {
          $project: {
            _id: 1,
            originalVideo: 1,
            videoTitle: 1,
            videoDescription: 1,
            originalVideo: 1,
            realViews: 1,
            thumbnail: 1,
            videoDescription: 1,
            category: 1,
            share: 1,
            avatar: 1,
            downloads: 1,
            createdAt: 1,
            reviewPoints: 1,
            likes: 1,
            privacy: 1,
            profileViews: 1,
            reviewPoints: 1,
            ageRestriction: 1,
            tags: 1,
            userId: 1,
            isPremier: 1,
            isPaid: 1,
            createdAt: 1,
            priceOfVideo: 1,
            qualities: 1,
            user_rating: {
              $sum: {
                $cond: {
                  if: { $gte: ["$reviewPoints.point", 0] },
                  then: "$reviewPoints.point",
                  else: 0,
                },
              },
            },
            following_count: {
              $cond: {
                if: { $isArray: "$followBy" },
                then: { $size: "$followBy" },
                else: 0,
              },
            },
            average_rating: {
              $avg: "$user_rating",
            },
            isFeatureVideo: 1,
          },
        },
        //video videoCreatedUser
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
                  email: 1,
                  username: 1,
                  firstName: 1,
                  lastName: 1,
                },
              },
            ],
            as: "videoCreatorData",
          },
        },
        //lookup for video likes
        {
          $lookup: {
            from: "videolikes",
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
                  userId: 1,
                  videoId: 1,
                  isLiked: {
                    $cond: [
                      { $eq: ["$userId", new objectId(user_Id)] },
                      true,
                      false,
                    ],
                  },
                },
              },
            ],
            as: "videoLikes",
          },
        },
        {
          $addFields: {
            isLiked: {
              $cond: {
                if: { $gte: ["$size", "$videoLikes"] },
                then: true,
                else: false,
              },
            },
          },
        },
        //total likes
        {
          $addFields: {
            like_count: { $size: "$videoLikes" },
          },
        },
        //video comments
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
                  userId: 1,
                  text: 1,
                  videoId: 1,
                  time: "$createdAt",
                },
              },
              //lokkup for the user who commented
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
                        email: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                      },
                    },
                  ],
                  as: "commentUserId",
                },
              },
              //video Comments Likes
              {
                $lookup: {
                  from: "videocommentlikes",
                  let: { commentId: { $toObjectId: "$_id" } },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$commentId", "$$commentId"],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        userId: 1,
                        // createdAt: 1,
                        videoId: 1,
                        commentId: 1,
                        time: "$createdAt",
                        isLiked: {
                          $cond: [
                            { $eq: ["$userId", new objectId(user_Id)] },
                            true,
                            false,
                          ],
                        },
                      },
                    },
                  ],
                  as: "videoCommentLikes",
                },
              },

              //lookup for the replies
              {
                $lookup: {
                  from: "videocommentsreplies",
                  let: { commentId: { $toObjectId: "$_id" } },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$commentId", "$$commentId"],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        userId: 1,
                        videoId: 1,
                        commentId: 1,
                        time: "$createdAt",
                        text: 1,
                      },
                    },

                    //the user data of reply
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
                              email: 1,
                              username: 1,
                              firstName: 1,
                              lastName: 1,
                            },
                          },
                        ],
                        as: "replyUserId",
                      },
                    },

                    // likes of the reply
                    {
                      $lookup: {
                        from: "videoreplylikes",
                        let: { replyId: { $toObjectId: "$_id" } },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $eq: ["$replyId", "$$replyId"],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                              userId: 1,
                              videoId: 1,
                              commentId: 1,
                              time: "$createdAt",
                              isLiked: {
                                $cond: [
                                  { $eq: ["$userId", new objectId(user_Id)] },
                                  true,
                                  false,
                                ],
                              },
                            },
                          },
                        ],
                        as: "videoCommentReplyLikes",
                      },
                    },
                    {
                      $addFields: {
                        total_likes: { $size: "$videoCommentReplyLikes" },
                      },
                    },
                  ],
                  as: "reply",
                },
              },
              //total likes
              {
                $addFields: {
                  total_likes: { $size: "$videoCommentLikes" },
                },
              },
              //total RepliesOfComments
              {
                $addFields: {
                  total_replies: { $size: "$reply" },
                },
              },
            ],
            as: "comments",
          },
        },
        {
          $lookup: {
            from: "followers",
            let: { userId: { $toObjectId: "$userId" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  followers: 1,
                  followBy: 1,
                },
              },
              {
                $addFields: {
                  likeIDs: {
                    // map out array of like id's
                    $map: {
                      input: "$followBy",
                      as: "followBy",
                      in: "$$followBy.userId",
                    },
                  },
                },
              },

              {
                $addFields: {
                  am_i_followed: {
                    $in: [new objectId(user_Id), "$likeIDs"], // it works now
                  },
                },
              },

              {
                $project: {
                  _id: 1,
                  followers: 1,
                  followBy: 1,
                  am_i_followed: 1,
                },
              },
            ],
            as: "followersData",
          },
        },
        //
        // //group
        {
          $group: {
            _id: "$_id",
            originalVideo: { $first: "$originalVideo" },
            videoTitle: { $first: "$videoTitle" },
            videoDescription: { $first: "$videoDescription" },
            realViews: { $first: "$realViews" },
            thumbnail: { $first: "$thumbnail" },
            videoDescription: { $first: "$videoDescription" },
            category: { $first: "$category" },
            share: { $first: "$share" },
            average_rating: { $first: "$average_rating" },
            avatar: { $first: "$avatar" },
            createdAt: { $first: "$createdAt" },
            downloads: { $first: "$downloads" },
            createdAt: { $first: "$createdAt" },
            reviewPoints: { $first: "$reviewPoints" },
            privacy: { $first: "$privacy" },
            isPremier: { $first: "$isPremier" },
            isPaid: { $first: "$isPaid" },
            priceOfVideo: { $first: "$priceOfVideo" },
            profileViews: { $first: "$profileViews" },
            ageRestriction: { $first: "$ageRestriction" },
            tags: { $first: "$tags" },
            userId: { $first: "$userId" },
            qualities: { $first: "$qualities" },
            isLiked: { $first: "$isLiked" },
            user_rating: { $first: "$user_rating" },
            isFeatureVideo: { $first: "$isFeatureVideo" },
            like_count: { $first: "$like_count" },
            videoCreatorData: { $first: "$videoCreatorData" },
            videoLikes: { $first: "$videoLikes" },
            comments: { $first: "$comments" },
            followersData: { $first: "$followersData" },
          },
        },
        // limit
        {
          $limit: 1,
        },
      ]);

      if (user_Id !== "------------") {
        const watchHistoryDetails = await WatchHistory.findOne({
          userId: user_Id,
          videosCategory: videoFromDb[0].category,
        });

        console.log("---watchHistoryDetails", watchHistoryDetails);
        if (!watchHistoryDetails?._id)
          await WatchHistory.create({
            userId: user_Id,
            videoId: id,
            videosCategory: videoFromDb[0].category,
          });
      }
      const { comments, replyUserData, isLiked, videoLikes } = videoFromDb[0];

      if (videoLikes.length > 0) {
        videoLikes.forEach((item, i) => {
          if (item?.userId.toString() === user_Id.toString())
            videoFromDb[0].isLiked = true;
        });
      }

      delete videoFromDb[0].videoLikes;

      // adding the videoto the watch video database

      if (videoFromDb.length > 0) {
        comments.forEach((comment, i) => {
          comment.userId = comment.commentUserId[0];
          delete comment.commentUserId;

          //checking for the user
          //if he had liked the video comemnt
          //start of the if for video comments likes
          if (comment.videoCommentLikes.length > 0) {
            comment.videoCommentLikes.forEach((like, i) => {
              if (like?.userId.toString() === user_Id.toString())
                comment.is_liked = true;
              else comment.is_liked = false;
            });
          } else comment.is_liked = false;

          delete comment.videoCommentLikes;

          //end of if

          //working on the reply of the comments
          // start of the reply if
          if (comment.reply.length > 0) {
            comment.reply.forEach((reply, i) => {
              reply.userId = reply.replyUserId[0];
              delete reply.replyUserId;

              //checking for the user
              //if he had liked the video
              //start of the if for video comments likes
              if (reply.videoCommentReplyLikes.length > 0) {
                reply.videoCommentReplyLikes.forEach((like, i) => {
                  if (like?.userId.toString() === user_Id.toString())
                    reply.is_liked = true;
                  else reply.is_liked = false;
                });
              } else reply.is_liked = false;

              delete reply.videoCommentReplyLikes;

              //end of if
            });
          }
        });
        return videoFromDb[0];
      } else {
        return [];
      }
    } catch (error) {
      console.log("🚀 ~ file: video.js ~ line 99 ~ videoById: ~ error", error);

      return new Error(errorName.SERVER_ERROR);
    }
  },

  videoByIdDevTesting: async ({ id }, ctx) => {
    try {
      let { user } = ctx;

      if (!user) user_Id = "------------";
      else user_Id = user.id;
      let videoFromDb = await Video.aggregate([
        {
          $match: {
            _id: new objectId(id),
          },
        },
        {
          $project: {
            _id: 1,
            originalVideo: 1,
            videoTitle: 1,
            videoDescription: 1,
            originalVideo: 1,
            realViews: 1,
            thumbnail: 1,
            videoDescription: 1,
            category: 1,
            share: 1,
            avatar: 1,
            downloads: 1,
            createdAt: 1,
            reviewPoints: 1,
            likes: 1,
            privacy: 1,
            profileViews: 1,
            reviewPoints: 1,
            ageRestriction: 1,
            tags: 1,
            userId: 1,
            isPremier: 1,
            isPaid: 1,
            createdAt: 1,
            priceOfVideo: 1,
            qualities: 1,
            user_rating: {
              $sum: {
                $cond: {
                  if: { $gte: ["$reviewPoints.point", 0] },
                  then: "$reviewPoints.point",
                  else: 0,
                },
              },
            },
            following_count: {
              $cond: {
                if: { $isArray: "$followBy" },
                then: { $size: "$followBy" },
                else: 0,
              },
            },
            average_rating: {
              $avg: "$user_rating",
            },
            isFeatureVideo: 1,
          },
        },
        //video videoCreatedUser
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
                  email: 1,
                  username: 1,
                  firstName: 1,
                  lastName: 1,
                },
              },
            ],
            as: "videoCreatorData",
          },
        },
        //lookup for video likes
        {
          $lookup: {
            from: "videolikes",
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
                  userId: 1,
                  videoId: 1,
                  isLiked: {
                    $cond: [
                      { $eq: ["$userId", new objectId(user_Id)] },
                      true,
                      false,
                    ],
                  },
                },
              },
            ],
            as: "videoLikes",
          },
        },
        {
          $addFields: {
            isLiked: {
              $cond: {
                if: { $gte: ["$size", "$videoLikes"] },
                then: true,
                else: false,
              },
            },
          },
        },
        //total likes
        {
          $addFields: {
            likes_count: { $size: "$videoLikes" },
          },
        },
        //video comments
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
                  userId: 1,
                  text: 1,
                  videoId: 1,
                  time: "$createdAt",
                },
              },
              //lokkup for the user who commented
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
                        email: 1,
                        username: 1,
                        firstName: 1,
                        lastName: 1,
                      },
                    },
                  ],
                  as: "commentUserId",
                },
              },
              //video Comments Likes
              {
                $lookup: {
                  from: "videocommentlikes",
                  let: { commentId: { $toObjectId: "$_id" } },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$commentId", "$$commentId"],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 0,
                        userId: 1,
                        // createdAt: 1,
                        videoId: 1,
                        commentId: 1,
                        time: "$createdAt",
                        isLiked: {
                          $cond: [
                            { $eq: ["$userId", new objectId(user_Id)] },
                            true,
                            false,
                          ],
                        },
                      },
                    },
                  ],
                  as: "videoCommentLikes",
                },
              },

              //lookup for the replies
              {
                $lookup: {
                  from: "videocommentsreplies",
                  let: { commentId: { $toObjectId: "$_id" } },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$commentId", "$$commentId"],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        userId: 1,
                        videoId: 1,
                        commentId: 1,
                        time: "$createdAt",
                        text: 1,
                      },
                    },

                    //the user data of reply
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
                              email: 1,
                              username: 1,
                              firstName: 1,
                              lastName: 1,
                            },
                          },
                        ],
                        as: "replyUserId",
                      },
                    },

                    // likes of the reply
                    {
                      $lookup: {
                        from: "videoreplylikes",
                        let: { replyId: { $toObjectId: "$_id" } },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $eq: ["$replyId", "$$replyId"],
                              },
                            },
                          },
                          {
                            $project: {
                              _id: 1,
                              userId: 1,
                              videoId: 1,
                              commentId: 1,
                              time: "$createdAt",
                              isLiked: {
                                $cond: [
                                  { $eq: ["$userId", new objectId(user_Id)] },
                                  true,
                                  false,
                                ],
                              },
                            },
                          },
                        ],
                        as: "videoCommentReplyLikes",
                      },
                    },
                    {
                      $addFields: {
                        total_likes: { $size: "$videoCommentReplyLikes" },
                      },
                    },
                  ],
                  as: "reply",
                },
              },
              //total likes
              {
                $addFields: {
                  total_likes: { $size: "$videoCommentLikes" },
                },
              },
              //total RepliesOfComments
              {
                $addFields: {
                  total_replies: { $size: "$reply" },
                },
              },
            ],
            as: "comments",
          },
        },
        {
          $lookup: {
            from: "followers",
            let: { userId: { $toObjectId: "$userId" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$userId"],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  followers: 1,
                  followBy: 1,
                },
              },
              {
                $addFields: {
                  likeIDs: {
                    // map out array of like id's
                    $map: {
                      input: "$followBy",
                      as: "followBy",
                      in: "$$followBy.userId",
                    },
                  },
                },
              },

              {
                $addFields: {
                  am_i_followed: {
                    $in: [new objectId(user_Id), "$likeIDs"], // it works now
                  },
                },
              },

              {
                $project: {
                  _id: 1,
                  followers: 1,
                  followBy: 1,
                  am_i_followed: 1,
                },
              },
            ],
            as: "followersData",
          },
        },
        //
        // //group
        {
          $group: {
            _id: "$_id",
            originalVideo: { $first: "$originalVideo" },
            videoTitle: { $first: "$videoTitle" },
            videoDescription: { $first: "$videoDescription" },
            realViews: { $first: "$realViews" },
            thumbnail: { $first: "$thumbnail" },
            videoDescription: { $first: "$videoDescription" },
            category: { $first: "$category" },
            share: { $first: "$share" },
            average_rating: { $first: "$average_rating" },
            avatar: { $first: "$avatar" },
            createdAt: { $first: "$createdAt" },
            downloads: { $first: "$downloads" },
            createdAt: { $first: "$createdAt" },
            reviewPoints: { $first: "$reviewPoints" },
            privacy: { $first: "$privacy" },
            isPremier: { $first: "$isPremier" },
            isPaid: { $first: "$isPaid" },
            priceOfVideo: { $first: "$priceOfVideo" },
            profileViews: { $first: "$profileViews" },
            ageRestriction: { $first: "$ageRestriction" },
            tags: { $first: "$tags" },
            userId: { $first: "$userId" },
            qualities: { $first: "$qualities" },
            isLiked: { $first: "$isLiked" },
            user_rating: { $first: "$user_rating" },
            isFeatureVideo: { $first: "$isFeatureVideo" },
            likes_count: { $first: "$likes_count" },
            videoCreatorData: { $first: "$videoCreatorData" },
            videoLikes: { $first: "$videoLikes" },
            comments: { $first: "$comments" },
            followersData: { $first: "$followersData" },
          },
        },
        // limit
        {
          $limit: 1,
        },
      ]);

      if (user_Id !== "------------") {
        const watchHistoryDetails = await WatchHistory.findOne({
          userId: user_Id,
          videosCategory: videoFromDb[0].category,
        });

        if (!watchHistoryDetails?._id)
          await WatchHistory.create({
            userId: user_Id,
            videoId: id,
            videosCategory: videoFromDb[0].category,
          });
      }
      let { comments, replyUserData, isLiked, videoLikes } = videoFromDb[0];

      if (videoLikes.length > 0) {
        videoLikes.forEach((item, i) => {
          if (item?.userId.toString() === user_Id.toString())
            videoFromDb[0].isLiked = true;
        });
      }

      delete videoFromDb[0].videoLikes;

      if (videoFromDb.length > 0) {
        comments.forEach((comment, i) => {
          comment.userId = comment.commentUserId[0];
          delete comment.commentUserId;

          //checking for the user
          //if he had liked the video comemnt
          //start of the if for video comments likes
          if (comment.videoCommentLikes.length > 0) {
            comment.videoCommentLikes.forEach((like, i) => {
              if (like?.userId.toString() === user_Id.toString())
                comment.is_liked = true;
              else comment.is_liked = false;
            });
          } else comment.is_liked = false;

          delete comment.videoCommentLikes;

          //end of if

          //working on the reply of the comments
          // start of the reply if
          if (comment.reply.length > 0) {
            comment.reply.forEach((reply, i) => {
              reply.userId = reply.replyUserId[0];
              delete reply.replyUserId;

              //checking for the user
              //if he had liked the video
              //start of the if for video comments likes
              if (reply.videoCommentReplyLikes.length > 0) {
                reply.videoCommentReplyLikes.forEach((like, i) => {
                  if (like?.userId.toString() === user_Id.toString())
                    reply.is_liked = true;
                  else reply.is_liked = false;
                });
              } else reply.is_liked = false;

              delete reply.videoCommentReplyLikes;

              //end of if
            });
          }
        });
        return videoFromDb[0];
      } else {
        return [];
      }
    } catch (error) {
      console.log("🚀 ~ file: video.js ~ line 99 ~ videoById: ~ error", error);

      return new Error(errorName.SERVER_ERROR);
    }
  },

  getAllUserVideos: async ({ id }, ctx) => {
    // console.log("🚀 ~ file: video.js ~ line 63 ~ getAllUserVideos: ~ ctx", ctx)
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let videoFromDb = await userVideos(id);
      return videoFromDb;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getAllUserVideosByRating: async ({ id }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let allVideos = await userVideosByRating(id);

      for (let i = 0; i < allVideos.length; i++) {
        let averageRating = videoAverageRating(allVideos[i]);
        allVideos[i].average_rating = averageRating;
      }
      return allVideos;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getFeatureVideos: async ({}, ctx) => {
    // console.log("🚀 ~ file: video.js ~ line 63 ~ getAllUserVideos: ~ ctx", ctx)
    try {
      let videoFromDb = await getFeatureVideos();
      return videoFromDb;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getRepliesOfComment: async ({ comment_id, video_id }, ctx) => {
    try {
      let { user } = ctx;

      if (!user) user_Id = "";
      else user_Id = user.id;
      const videoFromDb = await Video.aggregate([
        {
          $match: {
            _id: new objectId(video_id),
          },
        },

        {
          $project: {
            _id: 1,
            comments: 1,
          },
        },
        {
          $unwind: {
            path: "$comments",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            "comments._id": new objectId(comment_id),
          },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$comments.userId" },
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
                  email: 1,
                  username: 1,
                  firstName: 1,
                  lastName: 1,
                },
              },
            ],
            as: "commentsUserData",
          },
        },
        {
          $unwind: {
            path: "$comments.reply",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            let: { userId: "$comments.reply.userId" },
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
                  "comments.reply._id": 1,
                  _id: 1,
                  avatar: 1,
                  email: 1,
                  username: 1,
                  firstName: 1,
                  lastName: 1,
                },
              },
              {
                $addFields: {
                  total_likes: {
                    $cond: {
                      if: { $isArray: "$comments.reply.likes" },
                      then: { $size: "$comments.reply.likes" },
                      else: 0,
                    },
                  },
                },
              },
              {
                $addFields: {
                  is_liked: {
                    $cond: {
                      if: { $eq: ["$comments.likes.userId", user_Id] },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
            ],
            as: "replyUserData",
          },
        },
        {
          $group: {
            _id: "$_id",
            commentsUserData: { $push: "$commentsUserData" },
            replyUserData: { $push: "$replyUserData" },
            comments: { $push: "$comments" },
          },
        },
        {
          $limit: 1,
        },
      ]);

      // res.send(videoFromDb);
      if (videoFromDb.length > 0) {
        const { commentsUserData, comments, replyUserData } = videoFromDb[0];

        let newComments = [];
        let newReply = [];
        const flatArray = videoFromDb[0].commentsUserData.flat(Infinity);
        const flatReplyArray = videoFromDb[0].replyUserData.flat(Infinity);

        if (commentsUserData && comments && flatReplyArray) {
          comments.forEach((comment, index) => {
            flatArray.forEach((userData) => {
              if (userData?._id) {
                if (comment.userId.toString() === userData._id.toString())
                  comments[index]["userId"] = userData;
              }
            });

            flatReplyArray.forEach((reply, i) => {
              if (comment?.reply) {
                if (comment.reply.userId.toString() === reply._id.toString()) {
                  comment.reply["userId"] = reply;
                }
              }
            });

            if (comment?.reply) {
              if (
                comment._id.toString() === comment.reply.commentId.toString()
              ) {
                newReply.push(comment.reply);
              }
            }
          });

          newComments = comments.filter(
            (thing, index, self) =>
              index ===
              self.findIndex(
                (t) => t._id.toString() === thing._id.toString() //&& t.name === thing.name
              )
          );
          let updatedComments = [];
          newComments.forEach((comment) => {
            let replyArray = [];
            //  Object.assign(comment)
            newReply.forEach((reply) => {
              if (comment._id.toString() === reply.commentId.toString()) {
                replyArray.push(reply);
              }
            });
            delete comment.reply;
            comment["reply"] = replyArray;
            updatedComments.push(comment);
          });

          delete videoFromDb[0].commentsUserData;

          delete videoFromDb[0].replyUserData;
          videoFromDb[0].comments = updatedComments;
        }
      } else {
        return [];
      }
      if (videoFromDb.length > 0) return videoFromDb[0];
      else return [];
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 247 ~ getCommentsfVideo: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  realViews: async ({ id }, ctx) => {
    try {
      let videoFromDb = await videosById({ _id: id });
      if (videoFromDb.realViews === null)
        await updateVideo(id, { realViews: 1 });
      else await updateVideo(id, { realViews: videoFromDb.realViews + 1 });

      let realViews = await videosById({ _id: id });
      return realViews.realViews;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addDownloadVideoSuccess: async ({ id }, ctx) => {
    try {
      let videoFromDb = await videosById({ _id: id });
      await Video.updateOne(
        { _id: new objectId(id) },
        { $inc: { downloads: +1 } }
      );

      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  profileViews: async ({ id, fingerprint }, ctx) => {
    try {
      let videoFromDb = await videosById({ _id: id });
      //console.log("🚀 ~ file: video.js ~ line 201 ~ profileViews: ~ videoFromDb", videoFromDb)

      if (
        !videoFromDb?.profileViews?.find(
          (fin) => fin.fingerprint == fingerprint
        )
      ) {
        if (fingerprint && videoFromDb.profileViews) {
          videoFromDb.profileViews.push({ fingerprint });
          await videoFromDb.save();
        }
      }
      return "Succcess";
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 214 ~ profileViews: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  relatedWatchVideos: async ({ title, limit }, ctx) => {
    try {
      let videoFromDb = await relatedWatchVideos(title, limit);
      for (let i = 0; i < videoFromDb.length; i++) {
        let averageRating = videoAverageRating(videoFromDb[i]);
        videoFromDb[i].average_rating = averageRating;
      }
      return videoFromDb;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getSearchVideos: async ({ title, limit, skip }, ctx) => {
    try {
      let videos = await searchVideosByTitle(title, limit, skip);
      for (let i = 0; i < videos.length; i++) {
        let averageRating = videoAverageRating(videos[i]);
        videos[i].average_rating = averageRating;
      }
      return videos;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addReviewPoints: async ({ video_id, userId, point }, ctx) => {
    try {
      let video = await videosById({ _id: video_id });

      // console.log("---------", video);
      //
      if (video.reviewPoints.length > 0) {
        /**
         * looking for the video which is already have the
         */
        let findedVideo = video.reviewPoints.find(
          (vid) => vid.userId.toString() === userId.toString()
        );
        let findIndex = video.reviewPoints.findIndex(
          (vid) => vid.userId.toString() === userId.toString()
        );

        if (findedVideo?.userId) {
          const reviewPoints = await Video.findOneAndUpdate(
            {
              _id: video_id.toString(),
              "reviewPoints.userId": new objectId(userId.toString()),
            },
            {
              $set: {
                "reviewPoints.$.point": point,
              },
            }
          );

          if (reviewPoints.nModified) return "Success";
        }
      } else {
        const reviewPoints = await Video.updateOne(
          { _id: new objectId(video_id) },
          { $push: { reviewPoints: { userId, point } } }
        );
        if (reviewPoints) return "SUCCESS";
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  deleteVideo: async ({ id }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      await deleteVideo(id);
      // await History.findOne({})
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  editVideo: async ({ editVideo }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let id = editVideo.id;
      delete editVideo.id;
      await updateVideo(id, editVideo);
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addvideoToPlaylist: async ({ videoId, name, privacy }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const isPlaylist = await Playlist.findOne({ name: name });

      if (isPlaylist) {
        let findIndex = isPlaylist.playlist.findIndex(
          (vid) => vid.playlist_video_id == videoId
        );
        if (findIndex >= 0) {
          isPlaylist.playlist.splice(findIndex, 1);
          await isPlaylist.save();
          return "SUCCESS";
        } else {
          isPlaylist.playlist.unshift({ playlist_video_id: videoId });
          await isPlaylist.save();
          console.log("add playlist");
          return "SUCCESS";
        }
      }

      const playlistDoc = await Playlist.create({
        user_playlist: user?.id,
        name,
        privacy,
      });

      playlistDoc.playlist.unshift({ playlist_video_id: videoId });
      // console.log("🚀 ~ file: video.js ~ line 366 ~ addvideoToPlaylist: ~ playlistDoc", playlistDoc)

      await playlistDoc.save();
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  getUserPlaylistVideos: async ({ is_me, user_id }, ctx) => {
    try {
      console.log("is_me, user_id ::::", is_me, user_id);
      const playlist = await Playlist.find({
        user_playlist: user_id,
        privacy: is_me ? ["public", "private"] : "public",
      })
        .populate("user_playlist", "username avatar")
        .populate(
          "playlist.playlist_video_id",
          "videoTitle realViews thumbnail createdAt _id"
        );

      if (!playlist) return;

      return playlist;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getVisitorPlaylistVideos: async ({ visitor_id }, ctx) => {
    try {
      const playlist = await Playlist.find({ user_playlist: visitor_id })
        .populate("user_playlist", "username avatar")
        .populate(
          "playlist.playlist_video_id",
          "videoTitle realViews createdAt _id thumbnail"
        );

      if (!playlist) {
        return;
      }

      return playlist;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  removevideoFromPlaylist: async ({ videoId, playlist_id }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      const playList = await Playlist.findOne({ _id: playlist_id });

      let index = playList.playlist.findIndex(
        (vid) => vid.playlist_video_id == videoId
      );
      playList.playlist.splice(index, 1);
      await playList.save();
      return "Delete Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  shareVideo: async ({ id }, ctx) => {
    try {
      let videoFromDb = await videosById({ _id: id });
      await updateVideo(id, { share: videoFromDb[0].share + 1 });
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  addVideoToHistory: async ({ videoId, fingerprint }, ctx) => {
    try {
      const historyExist = await History.findOne({
        user_fingerprint: fingerprint,
      });

      if (historyExist?._id) {
        let findIndex = historyExist.history.findIndex(
          (vid) => vid.history_video_id == videoId
        );
        if (findIndex >= 0) {
          historyExist.history.splice(findIndex, 1);
          historyExist.history.unshift({
            history_video_id: videoId,
            createdAt: Date.now(),
          });
          await historyExist.save();
          return "SUCCESS";
        } else {
          historyExist.history.unshift({
            history_video_id: videoId,
            createdAt: Date.now(),
          });
          await historyExist.save();
          return "SUCCESS";
        }
      }

      const historyDoc = await History.create({
        user_fingerprint: fingerprint,
        createdAt: Date.now(),
      });

      historyDoc.history.unshift({
        history_video_id: videoId,
        createdAt: Date.now(),
      });
      await historyDoc.save();
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getUserHistoryVideos: async ({ fingerprint }, ctx) => {
    try {
      const historyExist = await History.findOne({
        user_fingerprint: fingerprint,
      })
        .populate({ path: "history", populate: { path: "history_video_id" } })
        .populate({
          path: "history.history_video_id",
          populate: { path: "userId" },
        });

      // console.log("-----------", historyExist);
      if (!historyExist) return null;
      const averageVideoObjectRating = (reviewPoints) => {
        if (reviewPoints?.length > 0 && reviewPoints) {
          let total = reviewPoints.reduce(function (acc, obj) {
            return acc + +obj.point;
          }, 0);
          return total / reviewPoints.length;
        } else {
          return 0;
        }
      };
      for (let i = 0; i < historyExist.history.length; i++) {
        if (historyExist?.history[i]?.history_video_id) {
          let averageRating = averageVideoObjectRating(
            historyExist.history[i].history_video_id.reviewPoints
          );
          historyExist.history[
            i
          ].history_video_id.average_rating = averageRating;
        }
      }
      return historyExist;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  removeVideoToHistory: async ({ videoHoistory }, ctx) => {
    try {
      if (videoHoistory.length === 0) return new Error(errorName.BAD_REQUEST);

      const historyArray = videoHoistory.map((history) => history.fingerprint);
      const videoArray = videoHoistory.map(
        (history) => new objectId(history.videoId)
      );

      const update = await History.updateOne(
        { user_fingerprint: { $in: historyArray } },
        { $pull: { history: { history_video_id: { $in: videoArray } } } }
      );

      if (update) {
        const historyExist = await History.findOne({
          user_fingerprint: videoHoistory[0].fingerprint,
        })
          .populate({ path: "history", populate: { path: "history_video_id" } })
          .populate({
            path: "history.history_video_id",
            populate: { path: "userId" },
          });

        const averageVideoObjectRating = (reviewPoints) => {
          if (reviewPoints?.length > 0 && reviewPoints) {
            let total = reviewPoints.reduce(function (acc, obj) {
              return acc + +obj.point;
            }, 0);
            return total / reviewPoints.length;
          } else {
            return 0;
          }
        };

        if (historyExist) {
          for (let i = 0; i < historyExist.history.length; i++) {
            if (historyExist?.history[i]?.history_video_id) {
              let averageRating = averageVideoObjectRating(
                historyExist.history[i].history_video_id.reviewPoints
              );
              historyExist.history[
                i
              ].history_video_id.average_rating = averageRating;
            }
          }
          // console.log("🚀 ~ file: video.js ~ line 503 ~ getUserHistoryVideos: ~ historyExist", historyExist.history[0].history_video_id.rating)
          return historyExist;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.trace("🚀 ~ file: user.js ~ line 654 ~ video.js: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getTopViewersUser: async ({}, ctx) => {
    try {
      const topViowers = await topViewers();
      const data = filterTop(topViowers, "realViews");

      return data;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 345 ~ getTopViewersUser: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },

  getTopDownloadersUser: async ({}, ctx) => {
    try {
      const topDownloads = await topDownloaders();
      const data = filterTop(topDownloads, "downloads");
      return data;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 345 ~ getTopViewersUser: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getTopSharesUser: async ({}, ctx) => {
    try {
      const topShare = await topShares();
      const data = filterTop(topShare, "share");
      return data;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 345 ~ getTopViewersUser: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getAllTrendingVideos: async ({}, ctx) => {
    try {
      const trendingVideos = await topTrending();
      // const data = filterTop(topShare, "share")
      for (let i = 0; i < trendingVideos.length; i++) {
        let averageRating = videoAverageRating(trendingVideos[i]);
        trendingVideos[i].average_rating = averageRating;
      }
      return trendingVideos;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 345 ~ getTopViewersUser: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addLikeToVideo: async ({ id }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let videoFromDb = await videosById({ _id: new objectId(id) });
      // const userWhoLiked = await getUserById(user.id);
      //
      // if (userWhoLiked === null) return { _id: null, text, user: user.id };
      // let obj = {
      //   _id: new objectId(),
      //   type: "Like",
      //   actionTitle: `${userWhoLiked.username} liked your video`,
      //   user_id: user.id,
      //   time: Date.now(),
      //   avatar: userWhoLiked.avatar,
      //   username: userWhoLiked.username,
      //   isRead: false,
      //   videoId: new objectId(videoFromDb._id)
      // };

      /**

        New Model of the Video Likes

      */

      const videoLikeStatus = await VideoLikes.findOne({
        userId: user.id,
        videoId: videoFromDb._id,
      });

      if (videoLikeStatus?._id) {
        const videoLikeStatusDelete = await VideoLikes.deleteOne({
          _id: videoLikeStatus._id,
        });
        console.log("=========== videoLike Deleted ============");
        if (videoLikeStatusDelete) return "Success";
      } else {
        const newLikesofComments = await VideoLikes.create({
          userId: new objectId(user.id),
          videoId: new objectId(videoFromDb._id),
        });
        console.log("=========== video Like Added ============");

        if (newLikesofComments) return "Success";
      }

      /**

      End of New Model of the Video Likes

      */

      // const indexOfVideoLike = await Video.aggregate([
      //   {
      //     $match: {
      //       _id: new objectId(id)
      //     }
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       likes: 1
      //     }
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       indexLike: {
      //         $indexOfArray: ["$likes.userId", new objectId(user.id)]
      //       }
      //     }
      //   }
      // ]);
      // if (indexOfVideoLike[0].indexLike === 0) {
      //   const commentStatus = await Video.updateOne(
      //     {
      //       _id: new objectId(id)
      //     },
      //     {
      //       $pull: {
      //         likes: { userId: user.id }
      //       }
      //     }
      //   );
      //   console.log("================= Like on Video Removed ===========");
      //
      //   if (commentStatus) {
      //     const notificationExist = await Notification.findOne({
      //       notification_user_id: new objectId(videoFromDb.userId.toString())
      //     });
      //
      //     if (notificationExist) {
      //       // console.log("notificationExist :::", notificationExist);
      //       notificationExist.count = notificationExist.count + 1;
      //       notificationExist.notifications.unshift(obj);
      //       await notificationExist.save();
      //     }
      //     return "Success";
      //   }
      // } else {
      //   const commentStatus = await Video.updateOne(
      //     {
      //       _id: new objectId(id)
      //     },
      //
      //     { $push: { likes: { userId: user.id } } }
      //   );
      //   console.log("================= Like on Video Added ===========");
      //   if (commentStatus) {
      //     const notificationExist = await Notification.findOne({
      //       notification_user_id: new objectId(videoFromDb.userId.toString())
      //     });
      //
      //     if (notificationExist) {
      //       // console.log("notificationExist :::", notificationExist);
      //       notificationExist.count = notificationExist.count + 1;
      //       notificationExist.notifications.unshift(obj);
      //       await notificationExist.save();
      //     }
      //     return "Success";
      //   }
      // }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  unlikeVideo: async ({ id }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let videoFromDb = await videosById({ _id: id });

      // console.log("Likes ---------------- > ", videoFromDb);

      let index = videoFromDb.likes.findIndex((fin) => fin.userId == user.id);
      if (index >= 0) {
        videoFromDb.likes.splice(index, 1);
        await videoFromDb.save();
      }
      return "Succcess";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  readNotification: async ({ notification_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const notifications = await Notification.findOne({
        notification_user_id: user.id,
      });

      const notificationIndex = notifications.notifications.findIndex(
        (not) => not._id == notification_id
      );

      notifications.notifications[notificationIndex].isRead = true;

      await notifications.save();
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getPremierVideos: async (ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const userSubscription = await Subscription.findOne({
        subscribedBy: user.id,
        subscribedTo: channelUserId,
      });

      const premierVideos = await Video.find({}).populate(
        "userId, username firstName lastName avatar email"
      );

      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};

// (async () => {
//   const addToWatchHistory = await WatchHistory.create({
//     userId: "620bae6d710f5b3a65acc933",
//     videoId: "620bb5ec8b5b9220587ee134",
//     videosCategory: "Cars",
//   });
// })();

// (async () => {
//   const user_Id = "";
//   const videoFromDb = await Video.aggregate([
//     {
//       $match: {
//         _id: new objectId("6221d011a924837fbcf7d8c7"),
//       },
//     },

//     {
//       $project: {
//         _id: 1,
//         comments: 1,
//       },
//     },
//     {
//       $unwind: {
//         path: "$comments",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $unwind: {
//         path: "$comments.reply",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $addFields: {
//         isLiked: {
//           $sum: {
//             $cond: {
//               if: { $eq: ["$likes.userId", user_Id] },
//               then: true,
//               else: false,
//             },
//           },
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: "$comments.userId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ["$_id", "$$userId"],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               avatar: 1,
//               email: 1,
//               username: 1,
//               firstName: 1,
//               lastName: 1,
//             },
//           },
//           {
//             $addFields: {
//               total_likes: {
//                 $cond: {
//                   if: { $isArray: "$comments.likes" },
//                   then: { $size: "$comments.likes" },
//                   else: 0,
//                 },
//               },
//             },
//           },
//           {
//             $addFields: {
//               is_liked: {
//                 $cond: {
//                   if: { $eq: ["$comments.likes.userId", user_Id] },
//                   then: true,
//                   else: false,
//                 },
//               },
//             },
//           },
//         ],
//         as: "commentsUserData",
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         let: { userId: "$comments.reply.userId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ["$_id", "$$userId"],
//               },
//             },
//           },
//           {
//             $project: {
//               "comments.reply._id": 1,
//               _id: 1,
//               avatar: 1,
//               email: 1,
//               username: 1,
//               firstName: 1,
//               lastName: 1,
//             },
//           },
//         ],
//         as: "replyUserData",
//       },
//     },

//     {
//       $group: {
//         _id: "$_id",
//         likes: { $first: "$comments.likes" },
//         commentsUserData: { $first: "$commentsUserData" },
//         replyUserData: { $push: "$replyUserData" },
//         comments: { $push: "$comments" },
//       },
//     },
//   ]);

//   console.log("-----", videoFromDb);
// })();
