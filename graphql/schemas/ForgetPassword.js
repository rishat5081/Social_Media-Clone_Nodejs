const router = require("express").Router();

const { resetPassword } = require("../resolvers/ForgetPassword");
router.post("/resetPassword", resetPassword);

module.exports = router;
