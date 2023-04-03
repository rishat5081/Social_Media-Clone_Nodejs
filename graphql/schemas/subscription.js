const router = require("express").Router();

const subscriptionController = require("../resolvers/subscription");
const { validateToken } = require("../../middleware/auth");

/**
 Routers for the videos
*/

router.get("/getPremiumVideo", subscriptionController.getPremiumVideo);
router.post(
  "/payforPremiumVideo",
  validateToken,
  subscriptionController.subscribeUser
);
router.post(
  "/checkSubscription",
  validateToken,
  subscriptionController.checkSubscription
);
router.get(
  "/getSubscribedVideos",
  validateToken,
  subscriptionController.getSubscribedVideos
);

//exports the router
module.exports = router;
