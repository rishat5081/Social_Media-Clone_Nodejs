const router = require("express").Router();
const { validateToken } = require("../../middleware/auth");
const galleryController = require("../resolvers/GalleryAPI");

router
  .route("/addLikeDisliketoPhoto")
  .post(validateToken, galleryController.addLikeDisliketoPhoto);

router.put("/updatePhoto", validateToken, galleryController.updatePhoto);

router.delete("/deletePhoto", validateToken, galleryController.deletePhoto);

module.exports = router;
