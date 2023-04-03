const User = require("../../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../../utils/jwt");
const { errorName } = require("../error/constants");
const { createUser, updateUser, getUserById } = require("../../services/user");
const { createFollower } = require("../../services/follower");
const { createArticle } = require("../../services/article");
const { videosById } = require("../../services/video");
const { connectedUsers } = require("../../utils/users");
const Notification = require("../../models/Notification");
const { getIO } = require("../../socket");
const Video = require("../../models/Video");
const VideoComments = require("../../models/VideoComments");
const VideoCommentLikes = require("../../models/VideoCommentLikes");
const VideoCommentsReply = require("../../models/VideoCommentsReply");
const VideoReplyLikes = require("../../models/VideoReplyLikes");
const objectId = require("mongodb").ObjectId;

module.exports = {
  addComment: async ({ text, video_id }, ctx) => {
    try {
      let { user } = ctx;
      if (!ctx.isAuth) return new Error(errorName.UN_AUTHORIZED);
      let onlineVideo = await videosById({ _id: video_id });
      const userWhoCommented = await getUserById(user.id);

      if (userWhoCommented === null) return { _id: null, text, user: user.id };
      else {
        const socketExistWhoUnFollow = connectedUsers.find(
          u => u.id === onlineVideo.userId.toString()
        );

        const notificationExist = await Notification.findOne({
          notification_user_id: new objectId(onlineVideo.userId.toString())
        });

        /**
          New Model of the Video Comments
        */
        const newComments = await VideoComments.create({
          userId: new objectId(user.id),
          text,
          videoId: new objectId(video_id)
        });

        if (newComments) {
          let obj = {
            _id: newComments?._id,
            type: "comment",
            actionTitle: `${userWhoCommented.username} Commmented on your video`,
            user_id: user.id,
            time: Date.now(),
            avatar: userWhoCommented.avatar,
            username: userWhoCommented.username,
            isRead: false,
            videoId: new objectId(video_id)
          };

          if (notificationExist) {
            // console.log("notificationExist :::", notificationExist);
            notificationExist.count = notificationExist.count + 1;
            notificationExist.notifications.unshift(obj);
            await notificationExist.save();
          }
          //sending the socket
          if (socketExistWhoUnFollow !== undefined) {
            obj.count = notificationExist.count;
            getIO()
              .to(socketExistWhoUnFollow.socket_id)
              .emit("comment", obj);
          }
          return {
            _id: newComments?._id,
            text,
            user: newComments?.userId,
            time: newComments?.createdAt,
            avatar: userWhoCommented.avatar,
            username: userWhoCommented.username
          };
        }
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  //new Code
  addLikeDislike: async ({ video_id, comment_id, userId }, ctx) => {
    try {
      const { user } = ctx;
      if (!ctx.isAuth) return new Error(errorName.UN_AUTHORIZED);

      let onlineVideo = await videosById({ _id: video_id });
      const userWhoLiked = await getUserById(user.id);

      if (userWhoLiked === null) return { _id: null, text, user: user.id };

      /**
        New Model of the Comment Likes

        */
      const commentLikesStatus = await VideoCommentLikes.findOne({
        userId: new objectId(user.id),
        videoId: new objectId(video_id),
        commentId: new objectId(comment_id)
      });

      const notificationExist = await Notification.findOne({
        notification_user_id: new objectId(onlineVideo.userId.toString())
      });
      let obj = {
        _id: new objectId(),
        type: "Like",
        actionTitle: `${userWhoLiked.username} liked your video`,
        user_id: user.id,
        time: Date.now(),
        avatar: userWhoLiked.avatar,
        username: userWhoLiked.username,
        isRead: false,
        videoId: new objectId(video_id)
      };

      if (commentLikesStatus?._id) {
        const videoLikeStatusDelete = await VideoCommentLikes.deleteOne({
          _id: commentLikesStatus._id
        });
        console.log("=========== Video Comment Like Deleted ============");

        if (notificationExist) {
          obj.actionTitle = `${userWhoLiked.username} unlike your video`;
          // console.log("notificationExist :::", notificationExist);
          notificationExist.count = notificationExist.count + 1;
          notificationExist.notifications.unshift(obj);
          await notificationExist.save();
        }

        if (videoLikeStatusDelete) return "Success";
      } else {
        const newLikesofComments = await VideoCommentLikes.create({
          userId: new objectId(user.id),
          videoId: new objectId(video_id),
          commentId: new objectId(comment_id)
        });
        console.log("=========== video Like Added ============");

        if (notificationExist) {
          // console.log("notificationExist :::", notificationExist);
          notificationExist.count = notificationExist.count + 1;
          notificationExist.notifications.unshift(obj);
          await notificationExist.save();
        }
        if (newLikesofComments) return "Success";
      }

      // if (indexOfCommentLike[0]?.indexLike === 0) {
      //   const commentStatus = await Video.updateOne(
      //     {
      //       _id: new objectId(video_id),
      //       "comments._id": new objectId(comment_id)
      //     },
      //     {
      //       $pull: {
      //         "comments.$.likes": { userId: userId }
      //       }
      //     }
      //   );
      //
      //   console.log("================= Like on Comment Removed ===========");
      //
      //   if (commentStatus) {
      //     // onlineVideo.comments[findCommentIndex].likes.splice(findLikeIndex, 1);
      //     // await onlineVideo.save();
      // const notificationExist = await Notification.findOne({
      //   notification_user_id: new objectId(onlineVideo.userId.toString())
      // });
      //
      // if (notificationExist) {
      //   // console.log("notificationExist :::", notificationExist);
      //   notificationExist.count = notificationExist.count + 1;
      //   notificationExist.notifications.unshift(obj);
      //   await notificationExist.save();
      // }
      //     return "Success";
      //   }
      // } else {
      //   const commentStatus = await Video.updateOne(
      //     {
      //       _id: new objectId(video_id),
      //       "comments._id": new objectId(comment_id)
      //     },
      //
      //     { $push: { "comments.$.likes": { userId: user.id } } }
      //   );
      //   console.log("================= Like on Comment Added ===========");
      //   if (commentStatus) {
      //     const notificationExist = await Notification.findOne({
      //       notification_user_id: new objectId(onlineVideo.userId.toString())
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
    }
  },

  addNestedLikeDislike: async (
    { video_id, comment_id, replied_comment_id, userId },
    ctx
  ) => {
    try {
      let { user } = ctx;

      if (!ctx.isAuth || !user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      /*** New Model Start */
      const replyLikesStatus = await VideoReplyLikes.findOne({
        userId: new objectId(user.id),
        videoId: new objectId(video_id),
        commentId: new objectId(comment_id),
        replyId: new objectId(replied_comment_id)
      });

      console.log(" ======== replyLikesStatus ", replyLikesStatus);

      if (replyLikesStatus?._id) {
        const videoLikeStatusDelete = await VideoReplyLikes.deleteOne({
          _id: replyLikesStatus._id
        });
        console.log("=========== Video Comment Like Deleted ============");
        if (replyLikesStatus) return "Success";
      } else {
        const newLikesofReply = await VideoReplyLikes.create({
          userId: new objectId(user.id),
          videoId: new objectId(video_id),
          commentId: new objectId(comment_id),
          replyId: new objectId(replied_comment_id)
        });
        console.log("=========== video Like Added ============");

        if (newLikesofReply) return "Success";
      }

      /*** end of the new Model ****/
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  addReplyToComment: async ({ video_id, comment_id, text }, ctx) => {
    try {
      let { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      let onlineVideo = await videosById({ _id: video_id });

      /*** Start of the New Model ***/

      const newReply = await VideoCommentsReply.create({
        userId: new objectId(user.id),
        commentId: new objectId(comment_id),
        text,
        videoId: new objectId(video_id)
      });

      console.log("----------- User Trying to Add Reply ----------");

      /*** End of the New Model ***/

      if (newReply) {
        const userWhoCommented = await getUserById(user.id);
        if (userWhoCommented === null)
          return {
            _id: null,
            text,
            user: user.id,
            likes: [],
            avatar: userWhoCommented.avatar,
            username: userWhoCommented.username,
            time: obj.time
          };
        else {
          let obj = {
            _id: new objectId(),
            type: "Reply",
            actionTitle: `${userWhoCommented.username} reply on comment of your video`,
            user_id: user.id,
            time: Date.now(),
            avatar: userWhoCommented.avatar,
            username: userWhoCommented.username,
            isRead: false,
            videoId: new objectId(video_id)
          };

          const notificationExist = await Notification.findOne({
            notification_user_id: new objectId(onlineVideo.userId.toString())
          });

          if (notificationExist) {
            notificationExist.count = notificationExist.count + 1;
            notificationExist.notifications.unshift(obj);
            await notificationExist.save();
          }
          return {
            _id: new objectId(comment_id),
            text,
            time: obj.time,
            avatar: userWhoCommented.avatar,
            username: userWhoCommented.username,
            user: user.id,
            likes: []
          };
        }
      } else {
        console.log("Reply is not added ---------::: ");
        return {};
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  addLikeDislikeToRepliedComment: async (
    { video_id, comment_id, userId },
    ctx
  ) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let onlineVideo = await videosById({ _id: video_id });

      let findCommentIndex = onlineVideo.comments.findIndex(
        co => co._id == comment_id
      );

      let findLikeIndex = onlineVideo.comments[
        findCommentIndex
      ].likes.findIndex(co => co == userId);
      console.log(
        "🚀 ~ file: comment.js ~ line 54 ~ addLikeDislike: ~ findLikeIndex",
        findLikeIndex
      );

      if (findLikeIndex >= 0) {
        onlineVideo.comments[findCommentIndex].likes.splice(findLikeIndex, 1);
        await onlineVideo.save();
        console.log("removed Like on same comment");
        return "Success";
      }

      onlineVideo.comments[findCommentIndex].likes.push(userId);
      await onlineVideo.save();
      console.log("adddd Like on same comment");
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  }
};
