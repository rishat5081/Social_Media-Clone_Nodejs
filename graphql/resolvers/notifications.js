const Notification = require("../../models/Notification");
const { errorName } = require("../error/constants");
const objectId = require("mongodb").ObjectId;
module.exports = {
  GetAllNotifications: async ({ userId }) => {
    try {
      if (!userId) return new Error(errorName.BAD_REQUEST);
      else {
        const allNotifications = await Notification.findOne(
          {
            notification_user_id: userId,
          },
          {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          }
        );

        if (allNotifications) return allNotifications;
        else
          return [
            {
              notification_user_id: userId,
              count: 0,
              notifications: [],
            },
          ];
      }
    } catch (error) {
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
