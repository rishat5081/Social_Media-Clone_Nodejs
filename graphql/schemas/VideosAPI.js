const router = require("express").Router();
const { validateToken } = require("../../middleware/auth");

const VideoAPI = require("../resolvers/VideoAPI");
router.get("/getRecommendedVideos", VideoAPI.getRecommendedVideos);
router.get("/getVideosByLocation", VideoAPI.getVideosByLocation);
router.get("/getAllVideos", VideoAPI.getAllVideos);
router.post(
  "/addWatchTimeofVideo",
  validateToken,
  VideoAPI.addWatchTimeofVideo
);
router.put("/updateVideo", validateToken, VideoAPI.updateVideo);
router.delete("/deleteVideo", validateToken, VideoAPI.deleteVideo);

module.exports = router;
