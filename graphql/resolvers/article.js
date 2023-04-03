const Article = require("../../models/Article");
const {
  getArticleById,
  getArticleByArticleId,
  getArticle,
  getRelatedWatchArticles,
  searchArticle,
  getAllArtricles,
  getSingleArticleById,
  updateArticle,
  getAllUserArticles,
} = require("../../services/article");
const { getUserFollower } = require("../../services/follower");
const { getUserById } = require("../../services/user");
const { errorName } = require("../error/constants");

module.exports = {
  articles: async ({ user_id }, ctx) => {
    try {
      const { user } = ctx;
      if (!user) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const article = await getAllUserArticles(user_id);
      return article;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  deleteUserArticle: async ({ article_id }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const { user } = ctx;

      await Article.findOneAndDelete({ _id: article_id });

      return "SUCCESS";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 53 ~ uploadPhotoToGallery: ~ err",
        err
      );
    }
  },

  createArticle: async ({ fields }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.BAD_REQUEST);
      }

      console.log("fields ::::::::", fields);
      fields.userId = user.id;
      await Article.create(fields);
      return "Successfully Created!";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  article: async ({ article_id }, ctx) => {
    try {
      const { user } = ctx;

      // let user = {};
      //
      // user.id = "62318774ae8945d38c416dff";
      const article = await getArticle(article_id);
      let followers = await getUserFollower(article.userId._id);

      article.following_count = followers.followBy.length;

      if (user?.id) {
        const isUserFollowing = followers.followBy.find(
          (u) => u.userId == user?.id
        );

        if (isUserFollowing) {
          article.am_i_followed = true;
          // console.log("am_i_followed true")
        } else {
          article.am_i_followed = false;
          // console.log("am_i_followed false")
        }

        for (let i = 0; i < article.comments.length; i++) {
          const isUserLikeThisComment = article.comments[i].likes.includes(
            user?.id
          );
          // console.log("comments section run")
          if (article.comments[i].reply.length > 0) {
            for (let j = 0; j < article.comments[i].reply.length; j++) {
              const isUserLikedReply = article.comments[i].reply[j].likes.find(
                (u) => u == user?.id
              );
              if (isUserLikedReply) {
                article.comments[i].reply[j].is_liked = true;
              } else {
                article.comments[i].reply[j].is_liked = false;
              }

              article.comments[i].reply[j].total_likes =
                article.comments[i].reply[j].likes.length;
            }
            // console.log("Comments section succcess")
          }
          if (isUserLikeThisComment) {
            article.comments[i].is_liked = isUserLikeThisComment;

            console.log("is_liked isUserLikeThisComment");
          } else {
            article.comments[i].is_liked = isUserLikeThisComment;
            console.log("is_liked else isUserLikeThisComment");
          }
          article.comments[i].total_likes = article.comments[i].likes.length;
          article.comments[i].total_replies = article.comments[i].reply.length;
          // console.log("total_likes  total_replies")
        }
        let likeIndex = article.likes.findIndex((fin) => fin.userId == user.id);
        console.log(
          "🚀 ~ file: article.js ~ line 122 ~ article: ~ likeIndex",
          likeIndex
        );
        let disLikeIndex = article.disLikes.findIndex(
          (fin) => fin.userId == user.id
        );
        console.log(
          "🚀 ~ file: article.js ~ line 123 ~ article: ~ disLikeIndex",
          disLikeIndex
        );

        if (likeIndex >= 0) {
          article.is_like = true;
        } else {
          article.is_like = false;
        }

        if (disLikeIndex >= 0) {
          article.is_dislike = true;
        } else {
          article.is_dislike = false;
        }
      } else {
        article.am_i_followed = false;
      }

      article.like_count = article.likes.length;
      article.dislike_count = article.disLikes.length;

      return article;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  shareArticle: async ({ id }, ctx) => {
    try {
      let articleInfo = await getArticleById({ _id: id });
      if (articleInfo?.share) {
        await updateArticle(id, {
          share: articleInfo.share + 1,
        });
      } else {
        await updateArticle(id, {
          share: 1,
        });
      }
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  getArticleRepliesOfComment: async ({ comment_id, article_id }, ctx) => {
    try {
      const article = await getArticle(article_id);
      const getCommentIndex = article.comments.findIndex(
        (c) => c._id == comment_id
      );
      const { user } = ctx;
      for (let i = 0; i < article.comments[getCommentIndex].reply.length; i++) {
        if (user?.id) {
          const isUserLikeReply = article.comments[getCommentIndex].reply[
            i
          ]?.likes?.find((r) => r == user?.id);
          if (isUserLikeReply) {
            article.comments[getCommentIndex].reply[i].is_liked = true;
          } else {
            article.comments[getCommentIndex].reply[i].is_liked = false;
          }
        }
        article.comments[getCommentIndex].reply[i].total_likes =
          article.comments[getCommentIndex].reply[i]?.likes.length;
      }

      return article.comments[getCommentIndex].reply;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 247 ~ getCommentsfVideo: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },

  addArticleView: async ({ article_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.BAD_REQUEST);
      }
      const article = await getArticle(article_id);
      article.views = article.views + 1;
      console.log(
        "🚀 ~ file: article.js ~ line 78 ~ addArticleView: ~ article",
        article.views
      );
      await article.save();
      return "SUCCESS";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },

  editArticle: async ({ editedArticle }, ctx) => {
    try {
      const { user } = ctx;

      if (!user) {
        return new Error(errorName.BAD_REQUEST);
      }
      let article = await getSingleArticleById(editedArticle.articleId);
      if (!article) {
        return new Error(errorName.NOT_FOUND);
      }

      let newObject = {
        theArticle: editedArticle.theArticle
          ? editedArticle.theArticle
          : article.theArticle,
        title: editedArticle.title ? editedArticle.title : article.title,
        category: editedArticle.category
          ? editedArticle.category
          : article.category,
        thumbnail: editedArticle.thumbnail
          ? editedArticle.thumbnail
          : article.thumbnail,
        tags: editedArticle.tags ? editedArticle.tags : article.tags,
        description: editedArticle.description
          ? editedArticle.description
          : article.description,
        imageUrl: editedArticle.imageUrl
          ? editedArticle.imageUrlF
          : article.imageUrl,
      };

      await Article.findOneAndUpdate(
        { _id: editedArticle.articleId },
        { $set: newObject },
        { new: true }
      );
      return "SUCESSFULLY CHANGED";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addCommentToArticle: async ({ text, article_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let article = await getArticle(article_id);
      console.log(
        "🚀 ~ file: article.js ~ line 182 ~ addCommentToArticle: ~ article",
        article
      );

      article.comments.unshift({ userId: user.id, text });

      const comment = await article.save();
      const newObj = comment.comments[0];
      newObj.user = newObj.userId;

      return newObj;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  addLikeDislikeToArticle: async ({ article_id, comment_id, userId }, ctx) => {
    console.log(
      "🚀 ~ file: article.js ~ line 161 ~ addLikeDislikeToArticle: ~ comment_id",
      comment_id
    );

    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let article = await getArticle({ _id: article_id });
      let findCommentIndex = article.comments.findIndex(
        (co) => co._id == comment_id
      );

      let findLikeIndex = article.comments[findCommentIndex].likes.findIndex(
        (co) => co == user.id
      );

      if (findLikeIndex >= 0) {
        article.comments[findCommentIndex].likes.splice(findLikeIndex, 1);
        await article.save();
        return "Success";
      }

      article.comments[findCommentIndex].likes.push(user.id);
      await article.save();
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  addReplyToCommentArticle: async ({ article_id, comment_id, text }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let article = await getArticle({ _id: article_id });

      let findCommentIndex = article.comments.findIndex(
        (co) => co._id == comment_id
      );
      article.comments[findCommentIndex].reply.unshift({
        userId: user.id,
        text,
      });

      const comment = await article.save();
      const newObj = comment.comments[findCommentIndex].reply[0];
      newObj.user = newObj.userId;
      return newObj;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  addNestedLikeDislikeArticleComment: async (
    { article_id, comment_id, replied_comment_id, userId },
    ctx
  ) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let article = await getArticle({ _id: article_id });

      let findCommentIndex = article.comments.findIndex(
        (co) => co._id == comment_id
      );
      let findNestedCommentIndex = article.comments[
        findCommentIndex
      ].reply.findIndex((co) => co._id == replied_comment_id);
      let findLikesIndex = article.comments[findCommentIndex].reply[
        findNestedCommentIndex
      ].likes.findIndex((co) => co == user.id);
      if (findLikesIndex >= 0) {
        article.comments[findCommentIndex].reply[
          findNestedCommentIndex
        ].likes.splice(findLikesIndex, 1);
        await article.save();
        return "Success";
      }

      article.comments[findCommentIndex].reply[
        findNestedCommentIndex
      ].likes.push(user.id);
      await article.save();
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  relatedWatchArticles: async ({ title }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      const articles = await getRelatedWatchArticles(title);
      return articles;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  searchArticles: async ({ title }, ctx) => {
    try {
      const articles = await searchArticle(title);

      console.log("articles :::", articles);
      return articles;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  getAllArticles: async ({}, ctx) => {
    try {
      const articles = await getAllArtricles();
      // console.log("🚀 ~ file: article.js ~ line 304 ~ getAllArticles: ~ articles", articles[0])
      return articles;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },

  addLikeToArticle: async ({ article_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      const article = await getArticle(article_id);

      if (!article.likes.find((ar) => ar.userId == user.id)) {
        article.likes.push({ userId: user.id });
        await article.save();
      }

      let index = article.disLikes.findIndex((fin) => fin.userId == user.id);
      if (index >= 0) {
        article.disLikes.splice(index, 1);
        await article.save();
      }
      return "Succcess";
    } catch (error) {
      console.log(
        "🚀 ~ file: article.js ~ line 377 ~ addLikeToArticle: ~ error",
        error
      );
    }
  },

  addDislikeToArticle: async ({ article_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }
      const article = await getArticle(article_id);
      let index = article.likes.findIndex((fin) => fin.userId == user.id);
      if (index >= 0) {
        article.likes.splice(index, 1);
        await article.save();
      }
      if (!article.likes.find((ar) => ar.userId == user.id)) {
        article.disLikes.push({ userId: user.id });
        await article.save();
      }
      return "Success";
    } catch (error) {
      console.log(
        "🚀 ~ file: article.js ~ line 399 ~ addDislikeToArticle: ~ error",
        error
      );
    }
  },
};
