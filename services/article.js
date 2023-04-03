const Article = require("../models/Article");

module.exports = {
  createArticle: (article) => {
    return Article.create(article);
  },

  getArticleById: (id) => {
    return Article.findOne({ _id: id, deleted: false });
  },

  getSingleArticleById: (id) => {
    return Article.find({ _id: id, deleted: false }).populate(
      "userId",
      "username avatar createdAt views share"
    );
  },
  getRelatedWatchArticles: (title) => {
    return Article.find({ category: title, deleted: false }).populate(
      "userId",
      "username avatar createdAt views"
    );
  },
  getArticleByArticleId: (id) => {
    return Article.find({ articles: { $elemMatch: { _id: id } } });
  },
  updateArticle: (id, obj) => {
    return Article.updateOne({ _id: id }, { $set: obj }, { new: true });
  },
  getArticle: (id) => {
    return Article.findOne({ _id: id, deleted: false })
      .populate("userId")
      .populate("comments.userId", "username time avatar")
      .populate("comments.reply.userId", "username time avatar");
  },
  searchArticle: (title) => {
    let s = `.*${title}.*`;
    return Article.aggregate([
      { $match: { title: { $regex: s.toString(), $options: "i" } } },
    ]);
  },
  getAllArtricles: () => {
    return Article.find(
      { deleted: false },
      {},
      { sort: { createdAt: -1 } }
    ).populate("userId");
  },
  getAllUserArticles: (userId) => {
    return Article.find({ userId, deleted: false }).populate("userId");
  },
};

// const createArticle = (article) => {
//   return Article.create(article);
// };

// const getArticleById = (id) => {
//   return Article.find({ userId: id }).populate(
//     "userId",
//     "username avatar createdAt views"
//   );
// };

// const getSingleArticleById = (id) => {
//   return Article.find({ _id: id }).populate(
//     "userId",
//     "username avatar createdAt views"
//   );
// };

// const getRelatedWatchArticles = (title) => {
//   return Article.find({ category: title }).populate(
//     "userId",
//     "username avatar createdAt views"
//   );
// };

// const getArticleByArticleId = (id) => {
//   return Article.find({ articles: { $elemMatch: { _id: id } } });
// };

// const updateArticle = (id, obj) => {
//   return Article.findOneAndUpdate({ _id: id }, { $set: obj }, { new: true });
// };

// const getArticle = (id) => {
//   return Article.findOne({ _id: id })
//     .populate("userId")
//     .populate("comments.userId", "username time avatar")
//     .populate("comments.reply.userId", "username time avatar");
// };

// const searchArticle = (title) => {
//   let s = `.*${title}.*`;
//   return Article.aggregate([
//     { $match: { title: { $regex: s.toString(), $options: "i" } } },
//   ]);
// };

// const getAllArtricles = () => {
//   return Article.find({}, {}, { sort: { createdAt: -1 } }).populate("userId");
// };
