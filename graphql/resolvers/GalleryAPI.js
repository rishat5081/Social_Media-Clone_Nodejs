const Gallery = require("../../models/Gallery");
// const WatchHistory = require("../../models/WatchHistory");
// const WatchTimeofVideo = require("../../models/WatchTimeofVideo");
// const { findLocation } = require("../../helpers/location");
const objectId = require("mongodb").ObjectId;

// Gallery.updateMany({}, { $set: { deleted: false } }, (err, ere) => {
//   if (err) console.log(err);
//
//   console.log(ere);
// });

module.exports = {
  addLikeDisliketoPhoto: async (req, res) => {
    try {
      const { photoId } = req.body;
      const userId = req.user.id;
      if (!(userId && photoId)) {
        res.status(400).send({ message: "UserId and PhotoId is required" });
        res.end();
        return;
      } else {
        const commentLikesStatus = await GalleryLikes.findOne({
          userId: new objectId(userId),
          galleryId: new objectId(photoId),
        });

        if (commentLikesStatus?._id) {
          const videoLikeStatusDelete = await GalleryLikes.deleteOne({
            _id: commentLikesStatus._id,
          });
          console.log("=========== Gallery Likes Like Deleted ============");
          if (videoLikeStatusDelete) {
            res.status(200).send({ message: "Like Removed", status: false });
            res.end();
            return;
          }
        } else {
          const newLikesofComments = await GalleryLikes.create({
            userId: new objectId(userId),
            galleryId: new objectId(photoId),
          });
          console.log("=========== Gallery Likes Added ============");

          if (newLikesofComments) {
            res.status(200).send({ message: "Like Added", status: true });
            res.end();
            return;
          }
        }
      }
    } catch (e) {}
  },
  updatePhoto: async (req, res) => {
    try {
      const { galleryId, title, imageUrl, description, date } = req.body;

      if (!galleryId) {
        res.status(404).send({
          status: false,
          message: "Photo Id is required",
        });
        res.end();
        return;
      }
      const article = await Gallery.findOne({
        _id: new objectId(galleryId),
      });

      if (article?._id) {
        const update = await Gallery.updateOne(
          { _id: galleryId },
          {
            $set: {
              title,
              imageUrl,
              description,
              date,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Gallery Updated",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Gallery",
          });
          res.end();
          return;
        }
      } else {
        res.status(404).send({
          status: false,
          message: "No Gallery Found with this Gallery Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Gallery");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
  deletePhoto: async (req, res) => {
    try {
      const { galleryId } = req.query;

      if (!galleryId) {
        res.status(404).send({
          status: false,
          message: "galleryId is required",
        });
        res.end();
        return;
      }
      const video = await Gallery.findOne({
        _id: new objectId(galleryId),
      });

      if (video?._id) {
        const update = await Gallery.updateOne(
          { _id: galleryId },
          {
            $set: {
              deleted: true,
            },
          }
        );

        if (update) {
          res.status(200).send({
            status: true,
            message: "Gallery Deleted",
          });
          res.end();
          return;
        } else {
          res.status(404).send({
            status: false,
            message: "Error Updating Gallery",
          });
          res.end();
          return;
        }
      } else {
        res.status(404).send({
          status: false,
          message: "No Gallery Found with this Gallery Id",
        });
        res.end();
        return;
      }
    } catch (e) {
      console.log("Error Occur on Updating the Gallery");
      console.trace(e);
      res.status(404).send({ status: false, message: e.message });
      res.end();
      return;
    }
  },
};
