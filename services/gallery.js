const Gallery = require("../models/Gallery");

const createGallery = (gallery) => {
  return Gallery.create(gallery);
};

const getGalleryDetails = async (id) => {
  return Gallery.findOne({ _id: id, deleted: false });
};

const getImageById = (image_id) => {
  return Gallery.findOne({ _id: image_id, deleted: false })
    .populate("userId", "username avatar createdAt realViews")
    .populate("comments.userId", "username time avatar")
    .populate("comments.reply.userId", "username time avatar");
};

const getSingleArticleById = (id) => {
  return Article.find({ _id: id, deleted: false }).populate(
    "userId",
    "username avatar createdAt realViews"
  );
};

const getRelatedWatchArticles = (title) => {
  return Article.find({ category: title, deleted: false }).populate(
    "userId",
    "username avatar createdAt realViews"
  );
};

const getArticleByArticleId = (id) => {
  return Article.find({
    deleted: false,
    articles: { $elemMatch: { _id: id } },
  });
};

const getArticle = (id) => {
  return Article.findOne({ _id: id })
    .populate("userId")
    .populate("comments.userId", "username time avatar")
    .populate("comments.reply.userId", "username time avatar");
};

const searchArticle = (title) => {
  let s = `.*${title}.*`;
  return Article.aggregate([
    { $match: { title: { $regex: s.toString(), $options: "i" } } },
  ]);
};

const getAllGaleriesById = (user_id) => {
  return Gallery.find(
    { userId: user_id },
    {},
    { sort: { createdAt: -1 } }
  ).populate("userId");
};

module.exports = {
  getGalleryDetails,
  createGallery,
  getImageById,
  getRelatedWatchArticles,
  getArticle,
  searchArticle,
  getAllGaleriesById,
  getSingleArticleById,
  getArticleByArticleId,
};
