const Notification = require("../models/Notification");
const { getAllUserFollowers } = require("../services/follower");
const { getIO } = require("../socket");
const { connectedUsers } = require("../utils/users");

async function notificaion(obj, req_user_id) {
  const userFollowers = await getAllUserFollowers(req_user_id);
  const followedUsersIds = [];
  for (let value of userFollowers.followBy) {
    followedUsersIds.push(value.userId._id);

    const notificationExist = await Notification.findOne({
      notification_user_id: value.userId._id,
    });
    if (!notificationExist) {
      const createNotifications = await Notification.create({
        notification_user_id: value.userId._id,
      });
      createNotifications.notifications.unshift(obj);
      await createNotifications.save();
    } else {
      notificationExist.notifications.unshift(obj);
      await notificationExist.save();
    }
  }

  let connectedSocketIds = [];

  for (let i = 0; i < connectedUsers.length; i++) {
    let isUserOnline = connectedUsers.find((u) => u.id == followedUsersIds[i]);
    if (isUserOnline) {
      connectedSocketIds.push(isUserOnline.socket_id);
    }
  }
  console.log(connectedSocketIds);

  for (let i = 0; i < connectedSocketIds.length; i++) {
    console.log(connectedSocketIds[i]);
    getIO().to(connectedSocketIds[i]).emit("videoNotify", obj);
  }
}

module.exports = notificaion;
