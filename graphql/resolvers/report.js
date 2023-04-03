const { getArticleById } = require("../../services/article");
const {
  getBlockUserDoc,
  createBlockedUser,
} = require("../../services/blockUser");
const { getSession } = require("../../services/session");
const { errorName } = require("../error/constants");
const Report = require("../../models/Report");

module.exports = {
  reportVideo: async ({ video_id, message }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const doc = await Report.create({ video_id, message, user_id: user.id });
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
