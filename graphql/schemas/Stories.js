const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const storyController = require("../resolvers/Stories");
const { validateToken } = require("../../middleware/auth");

//multer for storage
const storyMulter = multer.diskStorage({
  destination: "./stories/",
  limits: { fileSize: 100000000 },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

const uploadStory = multer({
  storage: storyMulter
});

/**
 Routers for the videos
*/
router.post(
  "/addStory",
  uploadStory.single("story"),
  validateToken,
  storyController.addStory
);

router.get("/getAllStories", validateToken, storyController.getAllStories);
router.get(
  "/getAllUserFollowingStories",
  validateToken,
  storyController.getAllUserFollowingStories
);

router.post("/viewStory", validateToken, storyController.viewStory);
router.get("/getStories", validateToken, storyController.getLimitedStories);
router.put("/addViewofStory", validateToken, storyController.addViewofStory);
router.post("/addLiketoStory", validateToken, storyController.addLiketoStory);
router.delete("/deleteStory", validateToken, storyController.deleteStory);

//exports the router
module.exports = router;

/**

Extra functions

*/

function checkFileType(file, cb) {
  const types = /jpeg|jpg|png|gif|mp4/;
  const fileBreakdown = file.mimetype.split("/");
  const extnames = types.test(fileBreakdown[1].toLowerCase());
  const mimetype = types.test(file.mimetype);

  if (extnames && mimetype) return cb(null, true);
  else cb("Wrong File Type");
}
