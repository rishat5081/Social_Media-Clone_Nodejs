const notificaion = require("../../helpers/notification");
const Notification = require("../../models/Notification");
const {
  getFollowerDocById,
  getAllUserFollowers,
  topFollwers,
  getAllFollowing,
} = require("../../services/follower");
const { getUserById } = require("../../services/user");
const { userVideos } = require("../../services/video");
const { getIO } = require("../../socket");
const { connectedUsers } = require("../../utils/users");
const { errorName } = require("../error/constants");
const { getAllUserVideos } = require("./video");
const { userAverageRating } = require("../../utils/averageRating");
const { truncate } = require("lodash");

module.exports = {
  addFollwer: async ({ whoToFollow }, ctx) => {
    try {
      const { user } = ctx;

      // let user = {};
      // user.id = "620baeba710f5b3a65acca91";

      const followerDoc = await getFollowerDocById(user.id);
      const followToDoc = await getFollowerDocById(whoToFollow.followToId);
      if (followToDoc) {
        if (
          followerDoc.followTo.find(
            (user) => user.userId == whoToFollow.followToId
          )
        ) {
          return;
        } else {
          followerDoc.followTo.push({ userId: whoToFollow.followToId });

          await followerDoc.save();
        }

        if (followToDoc.followBy.find((user) => user.userId == user.id)) {
          return;
        } else {
          followToDoc.followers += 1;
          followToDoc.followBy.push({ userId: user.id });
          const createdUser = await getUserById(user.id);
          await followToDoc.save();

          let obj = {
            type: "follow",
            actionTitle: "Following you",
            user_id: createdUser._id,
            time: Date.now(),
            avatar: createdUser.avatar,
            username: createdUser.username,
            isRead: false,
          };
          // await notificaion(obj , user.id)
          const socketExistWhoIFollow = connectedUsers.find(
            (u) => u.id == whoToFollow.followToId
          );
          const notificationExist = await Notification.findOne({
            notification_user_id: whoToFollow.followToId,
          });
          if (notificationExist) {
            notificationExist.count = notificationExist.count + 1;
            notificationExist.notifications.unshift(obj);
            // console.log("🚀 ~ file: follower.js ~ line 58 ~ addFollwer: ~ notificationExist", notificationExist)

            await notificationExist.save();
          }
          if (socketExistWhoIFollow) {
            obj.count = notificationExist.count;
            getIO().to(socketExistWhoIFollow.socket_id).emit("followedBy", obj);
            console.log("SEND NOTIFICATIONS");
          }
          // if(c)
        }
      }

      return "SUcessfully Followed";
    } catch (error) {
      console.log(
        "🚀 ~ file: follower.js ~ line 71 ~ addFollwer: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },

  removeFollower: async ({ whichFollower }, ctx) => {
    try {
      const { user } = ctx;

      const followerDoc = await getFollowerDocById(user.id);
      const followToDoc = await getFollowerDocById(
        whichFollower.removeFollwerId
      );

      const findFollowerDocIndex = followerDoc.followTo.findIndex(
        (user) => user.userId._id == whichFollower.removeFollwerId
      );
      const findFollowerToDocIndex = followToDoc.followBy.findIndex(
        (u) => u.userId._id == user.id
      );
      // const updateMany = await Notification.updateMany({},{count : 0})

      if (findFollowerDocIndex == -1) {
        return "";
      } else {
        followerDoc.followTo.splice(findFollowerDocIndex, 1);
        console.log("UNFOLLOW");
        await followerDoc.save();
        const createdUser = await getUserById(user.id);
        let obj = {
          type: "unfollow",
          actionTitle: "unfollow you",
          user_id: createdUser._id,
          time: Date.now(),
          avatar: createdUser.avatar,
          username: createdUser.username,
          isRead: false,
        };
        // await notificaion(obj , user.id)
        const socketExistWhoUnFollow = connectedUsers.find(
          (u) => u.id == whichFollower.removeFollwerId
        );
        const notificationExist = await Notification.findOne({
          notification_user_id: whichFollower.removeFollwerId,
        });
        if (notificationExist) {
          notificationExist.count = notificationExist.count + 1;
          notificationExist.notifications.unshift(obj);
          await notificationExist.save();
        }
        if (socketExistWhoUnFollow) {
          obj.count = notificationExist.count;
          getIO()
            .to(socketExistWhoUnFollow.socket_id)
            .emit("unfollowedBy", obj);
        }
      }

      if (findFollowerToDocIndex == -1) {
        return "";
      } else {
        followToDoc.followers -= 1;
        followToDoc.followBy.splice(findFollowerToDocIndex, 1);
        await followToDoc.save();
      }

      return "Successfully Removed";
    } catch (error) {
      console.log(
        "🚀 ~ file: follower.js ~ line 112 ~ removeFollower: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },
  followers: async ({}, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.BAD_REQUEST);
      }
      //
      // let user = {};
      // user.id = "62318774ae8945d38c416dff";
      const followerDoc = await getAllUserFollowers(user.id);
      console.log(followerDoc);
      return {
        userId: user.id,
        followBy: followerDoc.followBy.map((follow) => ({
          _id: follow._id,
          userId: follow.userId,
        })),
      };
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getAllUserFollowers: async ({ id }, ctx) => {
    try {
      const followerDoc = await getFollowerDocById(id);
      if (followerDoc) {
        return followerDoc.followBy.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  getVisitorProfileFollowers: async ({ id }, ctx) => {
    try {
      const followerDoc = await getFollowerDocById(id);
      if (followerDoc == null) {
        return null;
      }
      const allUserVideos = await userVideos(followerDoc.userId);
      const { user } = ctx;
      let isUserFollowing;
      if (user?.id) {
        isUserFollowing = followerDoc.followBy.find(
          (u) => u.userId._id == user.id
        );
      }
      let views = 0;
      let videoShares = 0;
      let videoDownloads = 0;
      if (allUserVideos) {
        allUserVideos.map((vid) => (views += vid.realViews));
        followerDoc.views = views;
        allUserVideos.map((vid) => (videoShares += vid.share));
        followerDoc.shares = videoShares;
        allUserVideos.map((vid) => (videoDownloads += vid.downloads));
        followerDoc.downloads = videoDownloads;
      }

      if (isUserFollowing) {
        followerDoc.am_i_followed = true;
        // console.log("am_i_followed true")
      } else {
        followerDoc.am_i_followed = false;
        // console.log("am_i_followed false")
      }

      for (let i = 0; i < followerDoc.followBy; i++) {
        let findUser = followerDoc.followBy.find((u) => u.userId == id);

        if (findUser) {
          followerDoc.followBy[i].userId.am_i_followed = true;
        } else {
          followerDoc.followBy[i].userId.am_i_followed = false;
        }
      }

      const avrgRating = userAverageRating(followerDoc.userId);
      followerDoc.average_rating = avrgRating;
      // console.log("🚀 ~ file: follower.js ~ line 219 ~ getVisitorProfileFollowers: ~ followerDoc", followerDoc)

      return followerDoc;
    } catch (error) {
      console.log(
        "🚀 ~ file: follower.js ~ line 184 ~ getVisitorProfileFollowers: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  getTopFollowersUser: async ({}, ctx) => {
    try {
      const topListFollowers = await topFollwers();

      topListFollowers.forEach((item, i) => {
        item.userId = item.users[0];
      });

      return topListFollowers;
    } catch (error) {
      console.log(
        "🚀 ~ file: follower.js ~ line 181 ~ getTopFollowersUser: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },
  getAllFollowingUsers: async ({ id }, ctx) => {
    try {
      if (!id) return new Error(errorName.BAD_REQUEST);

      const allFollowings = await getAllFollowing(id);
      return allFollowings.map((following) => following.userData[0]);
    } catch (error) {
      console.log(
        "🚀 ~ file: follower.js ~ line 181 ~ getTopFollowersUser: ~ error",
        error
      );

      return new Error(errorName.SERVER_ERROR);
    }
  },
};
