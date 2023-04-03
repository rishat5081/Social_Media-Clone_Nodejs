const BlockUser = require("../models/BlockUser");

const getBlockUserDoc = (id) => {
  return BlockUser.findOne({ userId: id }).populate(
    "blockedUsers.userId",
    "avatar username _id"
  );
};

const createBlockedUser = (obj) => {
  return BlockUser.create(obj);
};

module.exports = {
  getBlockUserDoc,
  createBlockedUser,
};
