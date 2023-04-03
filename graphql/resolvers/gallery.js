const Gallery = require("../../models/Gallery");
const {
  createGallery,
  getAllGaleriesById,
  getImageById,
} = require("../../services/gallery");
const GalleryLikes = require("../../models/GalleryLikes");
const { errorName } = require("../error/constants");
const objectId = require("mongodb").ObjectId;

module.exports = {
  gallery: async ({ user_id }, ctx) => {
    try {
      const gallery = await getAllGaleriesById(user_id);

      return gallery;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  deleteUserImage: async ({ image_id }, ctx) => {
    try {
      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      await Gallery.findOneAndDelete({ _id: image_id });

      return "SUCCESS";
    } catch (err) {
      console.log(
        "🚀 ~ file: user.js ~ line 53 ~ uploadPhotoToGallery: ~ err",
        err
      );
    }
  },
  createImage: async ({ fields }, ctx) => {
    try {
      const { user } = ctx;
      console.log(
        "🚀 ~ file: gallery.js ~ line 52 ~ createImage: ~ user",
        user
      );

      if (!user) {
        return new Error(errorName.BAD_REQUEST);
      }
      fields.userId = user.id;

      const image = await createGallery(fields);
      return image;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
      return new Error(errorName.SERVER_ERROR);
    }
  },
  image: async ({ image_id }, ctx) => {
    try {
      const { user } = ctx;
      const image = await getImageById(image_id);

      if (!image) {
        return new Error(errorName.NOT_FOUND);
      }

      if (user?.id) {
        for (let i = 0; i < image.comments.length; i++) {
          const isUserLikeThisComment = image.comments[i].likes.includes(
            user?.id
          );

          if (image.comments[i].reply.length > 0) {
            for (let j = 0; j < image.comments[i].reply.length; j++) {
              const isUserLikedReply = image.comments[i].reply[j].likes.find(
                (u) => u == user?.id
              );
              if (isUserLikedReply) {
                image.comments[i].reply[j].is_liked = true;
              } else {
                image.comments[i].reply[j].is_liked = false;
              }

              image.comments[i].reply[j].total_likes =
                image.comments[i].reply[j].likes.length;
            }
          }
          if (isUserLikeThisComment) {
            image.comments[i].is_liked = isUserLikeThisComment;
          } else {
            image.comments[i].is_liked = isUserLikeThisComment;
          }
          image.comments[i].total_likes = image.comments[i].likes.length;
          image.comments[i].total_replies = image.comments[i].reply.length;
        }
      }

      const like_count = await GalleryLikes.count({ galleryId: image_id });

      image.like_count = like_count;
      image.total_comments = image.comments.length;
      image.views += 1;
      await image.save();
      return image;
    } catch (error) {
      console.log("🚀 ~ file: gallery.js ~ line 121 ~ image: ~ error", error);

      return new Error(errorName.SERVER_ERROR);
    }
  },
  getImageRepliesOfComment: async ({ comment_id, image_id }, ctx) => {
    try {
      const image = await getImageById(image_id);
      const getCommentIndex = image.comments.findIndex(
        (c) => c._id == comment_id
      );
      const { user } = ctx;
      for (let i = 0; i < image.comments[getCommentIndex].reply.length; i++) {
        if (user?.id) {
          const isUserLikeReply = image.comments[getCommentIndex].reply[
            i
          ]?.likes?.find((r) => r == user?.id);
          if (isUserLikeReply) {
            image.comments[getCommentIndex].reply[i].is_liked = true;
          } else {
            image.comments[getCommentIndex].reply[i].is_liked = false;
          }
        }
        image.comments[getCommentIndex].reply[i].total_likes =
          image.comments[getCommentIndex].reply[i]?.likes.length;
      }

      return image.comments[getCommentIndex].reply;
    } catch (error) {
      console.log(
        "🚀 ~ file: video.js ~ line 247 ~ getCommentsfVideo: ~ error",
        error
      );
      return new Error(errorName.SERVER_ERROR);
    }
  },
  addCommentToImage: async ({ text, image_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let image = await getImageById(image_id);

      image.comments.unshift({ userId: user.id, text });

      const comment = await image.save();
      const newObj = comment.comments[0];
      newObj.user = newObj.userId;

      return newObj;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },
  addLikeDislikeToImageComment: async ({ image_id, comment_id }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let article = await getImageById(image_id);
      let findCommentIndex = article.comments.findIndex(
        (co) => co._id == comment_id
      );

      let findLikeIndex = article.comments[findCommentIndex].likes.findIndex(
        (co) => co == user.id
      );

      if (findLikeIndex >= 0) {
        article.comments[findCommentIndex].likes.splice(findLikeIndex, 1);
        await article.save();
        return 0;
      }

      article.comments[findCommentIndex].likes.push(user.id);
      await article.save();
      return 1;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },
  addReplyToImageComment: async ({ image_id, comment_id, text }, ctx) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let image = await getImageById(image_id);

      let findCommentIndex = image.comments.findIndex(
        (co) => co._id == comment_id
      );
      image.comments[findCommentIndex].reply.unshift({ userId: user.id, text });

      const comment = await image.save();
      const newObj = comment.comments[findCommentIndex].reply[0];
      newObj.user = newObj.userId;
      return newObj;
    } catch (error) {
      console.log(
        "🚀 ~ file: gallery.js ~ line 231 ~ addReplyToImageComment: ~ error",
        error
      );
    }
  },
  addNestedLikeDislikeToImageCommentReply: async (
    { image_id, comment_id, replied_comment_id },
    ctx
  ) => {
    try {
      const { user } = ctx;

      if (!ctx.isAuth) {
        return new Error(errorName.UN_AUTHORIZED);
      }

      let image = await getImageById(image_id);

      let findCommentIndex = image.comments.findIndex(
        (co) => co._id == comment_id
      );
      let findNestedCommentIndex = image.comments[
        findCommentIndex
      ].reply.findIndex((co) => co._id == replied_comment_id);
      let findLikesIndex = image.comments[findCommentIndex].reply[
        findNestedCommentIndex
      ].likes.findIndex((co) => co == user.id);
      if (findLikesIndex >= 0) {
        image.comments[findCommentIndex].reply[
          findNestedCommentIndex
        ].likes.splice(findLikesIndex, 1);
        await image.save();
        return 0;
      }

      image.comments[findCommentIndex].reply[findNestedCommentIndex].likes.push(
        user.id
      );
      await image.save();
      return 1;
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },
  addShareToImage: async ({ image_id }, ctx) => {
    try {
      const image = await getImageById(image_id);
      image.share += 1;
      await image.save();
      return "Success";
    } catch (error) {
      console.log("🚀 ~ file: user.js ~ line 77 ~ editUser: ~ error", error);
    }
  },
};
