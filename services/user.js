const User = require("../models/User");
const objectId = require("mongodb").ObjectId;

const createUser = (user) => {
  return User.create(user);
};

const getUserById = async (id) => {
  return await User.findOne({ _id: id, deleted: false }).select(
    "_id firstName lastName username  sideBarAvatar  phoneNumber vyzmo_id  email  password  gender  age  avatar webLink  about facebook tiktok token twitter instagram twoFactorAuthentication backgroundCover donationPaypalEmail  updatedAt"
  );
};
const getUserByIdforVideo = async (id) => {
  return await User.findOne({ _id: id, deleted: false }).select(
    "_id username email avatar"
  );
};

const getUserDeviceToken = async (id) => {
  // return User.updateMany({ gender: null }, {
  //     rating: []
  // })
  console.log("id ======>>>>>>>>>>>>>>>>>", id);
  return await User.findOne({ _id: id.opponentId, deleted: false }).select(
    "iosDeviceToken androidDeviceToken"
  );
};

const getManyUsersByIds = (id) => {
  return User.find({ _id: { $in: id }, deleted: false }).select(
    "_id firstName lastName username avatar email online updatedAt"
  );
};

const getRelatedProfiles = (title) => {
  let s = `.*${title}.*`;
  return User.aggregate([
    {
      $match: {
        username: { $regex: s.toString(), $options: "i" },
        deleted: false,
      },
    },
    { $limit: 15 },
  ]);
};

const getAllConditionalUsers = (condition) => {
  return User.find(condition).select("-password");
};

const getAllUsers = () => {
  return User.find({ deleted: false }).select("-password");
};

const updateUser = (id, obj) => {
  return User.findOneAndUpdate(
    { _id: id, deleted: false },
    { $set: obj },
    { new: true }
  );
};

const deleteUser = (id, obj) => {
  return User.findOneAndDelete({ _id: id, deleted: false });
};

const getPackagesDetail = () => {
  return User.find().select("package");
};

module.exports = {
  createUser,
  getUserById,
  getUserByIdforVideo,
  getAllConditionalUsers,
  getAllUsers,
  updateUser,
  getUserDeviceToken,
  deleteUser,
  getPackagesDetail,
  getRelatedProfiles,
  getManyUsersByIds,
};
