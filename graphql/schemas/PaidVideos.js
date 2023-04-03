const router = require("express").Router();
const PaidVideosControllers = require("../resolvers/PaidVideos");

const { validateToken } = require("../../middleware/auth");

router.post("/payforVideo", validateToken, PaidVideosControllers.payforVideo);
router.get(
  "/checkPaidVideo",
  // validateToken,
  PaidVideosControllers.checkPaidVideo
);
router.get(
  "/getAllPaidVideos",
  validateToken,
  PaidVideosControllers.getAllPaidVideos
);

module.exports = router;
