const router = require("express").Router();
const { validateToken } = require("../../middleware/auth");

const ArticlesAPI = require("../resolvers/ArticlesAPI");

// router.get("/getRecommendedVideos", ArticlesAPI.getRecommendedVideos);
// router.get("/getVideosByLocation", ArticlesAPI.getVideosByLocation);
// router.get("/getAllVideos", ArticlesAPI.getAllVideos);
// router.post(
//   "/addWatchTimeofVideo",
//   validateToken,
//   ArticlesAPI.addWatchTimeofVideo
// );
router.put("/updateArticle", validateToken, ArticlesAPI.updateArticle);
router.delete("/deleteArticle", validateToken, ArticlesAPI.deleteArticle);

module.exports = router;
