const router = require("express").Router();
const { validateToken } = require("../../middleware/auth");
const UserAPI = require("../resolvers/UserAPI");
router.put("/deleteUser", UserAPI.deleteUser);
// router.get("/getVideosByLocation", UserAPI.getVideosByLocation);
// router.get("/getAllVideos", UserAPI.getAllVideos);
// router.post("/addWatchTimeofVideo", validateToken, UserAPI.addWatchTimeofVideo);
// router.put("/updateVideo", validateToken, UserAPI.updateVideo);
// router.delete("/deleteVideo", validateToken, UserAPI.deleteVideo);

module.exports = router;
