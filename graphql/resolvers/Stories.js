const {
  uploadStoryToAWS,
  generateThumbnailsOfStory,
} = require("../../helpers/Upload Stories AWS");
const fs = require("fs");
const Story = require("../../models/Stories");

const User = require("../../models/User");
const Follower = require("../../models/Follower");
const StoryViews = require("../../models/StoryViews");
const StoryLike = require("../../models/StoryLike");

const { getAllFollowingList } = require("../../services/follower");
const { getUserByIdforVideo } = require("../../services/user");
const { errorName } = require("../error/constants");
const {
  getAllFollowingStories,
  getStoriesByLimit,
  getStoryViewers,
} = require("../../services/Stories");
const objectId = require("mongodb").ObjectId;
module.exports = {
  addStory: async (req, res) => {
    try {
      let { isVideo, caption } = req.body,
        thumbnail = "";
      if (req.file) {
        const awsUpload = await uploadStoryToAWS(
          req.file.path,
          req.file.filename
        );
        console.log("=========== isVideo ==========", isVideo);
        if (isVideo === "true") {
          thumbnail = await generateThumbnailsOfStory(req.file.path);
        } else {
          thumbnail = "image";
        }
        console.log("===  thumbnail === ", thumbnail);
        if (awsUpload && thumbnail) {
          fs.unlinkSync(req.file.path);
          const storyResponse = await Story.create({
            userId: req.user.id,
            caption,
            typeOfFile: req.file.mimetype,
            storyURL: awsUpload,
            thumbnail,
          });

          const User = await getUserByIdforVideo(req.user.id);
          if (storyResponse && User) {
            res
              .status(200)
              .send({ storyLink: awsUpload, thumbnail, storyResponse, User });
            res.end();
            return;
          }
        } else {
          fs.unlinkSync(req.file.path);
          res.status(404).send({ message: "Unable to Upload Story", error });
          res.end();
          return;
        }
      }
    } catch (e) {
      res.status(404).send({ message: errorName.SERVER_ERROR });
      res.end();
      return;
    }
  },
  getAllStories: async (req, res) => {
    console.log("req.user.id ", req.user.id);
    try {
      const allStories = await User.aggregate([
        {
          $match: {
            _id: new objectId(req.user.id),
          },
        },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            avatar: 1,
          },
        },
        {
          $lookup: {
            from: "stories",
            let: { user_Id: { $toObjectId: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$userId", "$$user_Id"],
                  },
                },
              },
            ],
            as: "stories",
          },
        },
      ]);

      // const allStories = await Story.find(
      //   {
      //     userId: new objectId(req.user.id)
      //   },
      //   {
      //     typeOfFile: 0,
      //     updatedAt: 0,
      //     __v: 0
      //   }
      // ).populate("userId", "username avatar");

      if (allStories.length > 0) {
        res.status(200).send({ stories: allStories });
        res.end();
        return;
      } else {
        res.status(200).send({ stories: [] });
        res.end();
        return;
      }
    } catch (e) {
      if (e) {
        res.status(404).send({ err: new Error(errorName.SERVER_ERROR), error });
        res.end();
        return;
      }
    }
  },
  getAllUserFollowingStories: async (req, res) => {
    try {
      const allFollowings = await getAllFollowingList(req.user.id);

      if (allFollowings.length) {
        const allFollowingStories = await getAllFollowingStories(
          allFollowings,
          req.user.id
        );

        res.status(200).send({ stories: allFollowingStories });
        res.end();
        return;
      } else {
        res.status(200).send({ stories: [] });
        res.end();
        return;
      }
    } catch (e) {
      if (e) {
        res
          .status(404)
          .send({ message: "Error Getting all Following Users Stories" });
        res.end();
        return;
      }
    }
  },
  viewStory: async (req, res) => {
    try {
      const { userId, storyId } = req.body;
      if (!(userId && storyId)) {
        res.status(400).send({ message: "UserId and StoryId is required" });
        res.end();
        return;
      } else {
        const storyViewers = await getStoryViewers(userId, storyId);
        if (storyViewers) {
          res.status(200).send({ storyViewers });
          res.end();
          return;
        } else {
          res.status(200).send({ storyViewers: [] });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("Error in Viewing the Story");
      console.trace(e);
      res.status(404).send({ message: "Error in Viewing the Story", error });
      res.end();
      return;
    }
  },
  getLimitedStories: async (req, res) => {
    try {
      const { limit, offset } = req.query;
      if (!limit && !offset) {
        res.status(400).send({ message: "Limit and Offset is Required" });
        res.end();
        return;
      } else {
        const stories = await getStoriesByLimit(limit, offset);
        if (stories.length > 0) {
          res.status(200).send({ stories });
          res.end();
          return;
        } else {
          res.status(200).send({ stories: [], message: "No More Stories" });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("Error in Get Stories the Story");
      console.trace(e);
      res.status(404).send({ message: "Error in Get Stories the Story" });
      res.end();
      return;
    }
  },
  addViewofStory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { storyId } = req.body;

      if (!(storyId && userId)) {
        res
          .status(400)
          .send({ message: "storyId & viewerId & userId is Required" });
        res.end();
        return;
      } else {
        const viewStatus = await StoryViews.findOne({
          userId: new objectId(userId),
          storyId: new objectId(storyId),
        });
        if (viewStatus?._id) {
          res.status(200).send({ status: false });
          res.end();
          return;
        } else {
          const likeAdded = await StoryViews.create({
            userId: new objectId(userId),
            storyId: new objectId(storyId),
          });
          if (likeAdded?._id) {
            res.status(200).send({ status: true });
            res.end();
            return;
          }
        }
      }
    } catch (e) {
      console.log("Error in add View to Stories");
      console.trace(e);
      res.status(404).send({ message: "Error in add View to Stories", error });
      res.end();
      return;
    }
  },
  deleteStory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { storyId } = req.query;

      if (!(storyId && userId)) {
        res.status(400).send({ message: "storyId  & userId is Required" });
        res.end();
        return;
      } else {
        const viewStatus = await Story.findOne({
          userId: new objectId(userId),
          _id: new objectId(storyId),
        });
        if (viewStatus?._id) {
          const likeAdded = await Story.deleteOne({
            userId: new objectId(userId),
            _id: new objectId(storyId),
          });
          res.status(200).send({ status: true });
          res.end();
          return;
        } else {
          res.status(200).send({ status: false, message: "Story not found" });
          res.end();
          return;
        }
      }
    } catch (e) {
      console.log("Error in add View to Stories");
      console.trace(e);
      res.status(404).send({ message: "Error in add View to Stories" });
      res.end();
      return;
    }
  },
  addLiketoStory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { storyId } = req.body;

      if (!(storyId && userId)) {
        res.status(400).send({ message: "storyId & userId is Required" });
        res.end();
        return;
      } else {
        const likeStatus = await StoryLike.findOne({
          userId: new objectId(userId),
          storyId: new objectId(storyId),
        });

        if (likeStatus?._id) {
          const likeStatus = await StoryLike.deleteOne({
            userId: new objectId(userId),
            storyId: new objectId(storyId),
          });
          res.status(200).send({ status: false });
          res.end();
          return;
        } else {
          const viewAdded = await StoryLike.create({
            userId: new objectId(userId),
            storyId: new objectId(storyId),
          });
          if (viewAdded) {
            res.status(200).send({ status: true });
            res.end();
            return;
          }
        }
      }
    } catch (e) {
      console.log("Error in add View to Stories");
      console.trace(e);
      res.status(404).send({ message: "Error in add View to Stories", error });
      res.end();
      return;
    }
  },
};
//
// (async () => {
//   const allStories = await User.aggregate([
//     {
//       $match: {
//         _id: new objectId("623d7298100c5b1ce9b05735")
//       }
//     },
//     {
//       $project: {
//         _id: 1,
//         firstName: 1,
//         lastName: 1,
//         avatar: 1
//       }
//     },
//     {
//       $lookup: {
//         from: "stories",
//         let: { user_Id: { $toObjectId: "$_id" } },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $eq: ["$userId", "$$user_Id"]
//               }
//             }
//           }
//         ],
//         as: "stories"
//       }
//     }
//   ]);
//
//   console.log("allStories", allStories);
// })();
