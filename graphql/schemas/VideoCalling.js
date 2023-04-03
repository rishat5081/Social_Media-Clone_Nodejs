const router = require("express").Router();
const VideoCallingController = require("../resolvers/VideoCalling");

router.post("/startVideoCall", VideoCallingController.startVideoCall);
router.post("/endVideoCall", VideoCallingController.endVideoCall);
module.exports = router;
