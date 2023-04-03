const router = require("express").Router();
const { validateToken } = require("../../middleware/auth");
const WalletAPI = require("../resolvers/WalletAPI");
router.get("/getWalletBalance", validateToken, WalletAPI.getWalletBalance);
// router.get("/getVideosByLocation", VideoAPI.getVideosByLocation);
// router.get("/getAllVideos", VideoAPI.getAllVideos);
// router.post("/addWatchTimeofVideo", VideoAPI.addWatchTimeofVideo);

module.exports = router;
