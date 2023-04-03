const { getArticleById } = require("../../services/article");
const {
  getBlockUserDoc,
  createBlockedUser,
} = require("../../services/blockUser");
const BlockUser = require("../../models/BlockUser");
const { errorName } = require("../error/constants");

module.exports = {
  blockedUsers: async ({ id }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const doc = await getBlockUserDoc(id);

      if (doc === null) {
        return [];
      } else {
        return doc.blockedUsers;
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 22 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  blockUser: async ({ obj }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      const isBlockDoc = await getBlockUserDoc(user.id);
      if (isBlockDoc === null) {
        const blockuserStatus = new BlockUser({ userId: user.id });
        blockuserStatus.blockedUsers.push({ userId: obj.userId });
        await blockuserStatus.save();
        return "Successfully Blocked Users";
      }

      if (!isBlockDoc.blockedUsers.find((bl) => bl.userId == obj.userId)) {
        let isFind = isBlockDoc.blockedUsers.find(
          (bl) => bl.userId == obj.userId
        );

        if (!isFind) {
          isBlockDoc.blockedUsers.push({ userId: obj.userId });

          await isBlockDoc.save();
          return "Successfully Blocked Users";
        } else {
          return "Successfully Blocked Users";
        }
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  unblockUser: async ({ obj }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const isBlockDoc = await getBlockUserDoc(user.id);
      console.log(
        "🚀 ~ file: blockUser.js ~ line 83 ~ unblockUser: ~ isBlockDoc",
        isBlockDoc
      );

      if (isBlockDoc) {
        if (isBlockDoc.blockedUsers.find((bl) => bl.userId._id == obj.userId)) {
          let index = isBlockDoc.blockedUsers.findIndex(
            (bl) => bl.userId == obj.userId
          );
          isBlockDoc.blockedUsers.splice(index, 1);

          await isBlockDoc.save();
          console.log("1");
          return "Successfully UnBlock User";
        } else {
          console.log("2");
          return new Error(errorName.BAD_REQUEST);
        }
      }
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
};
