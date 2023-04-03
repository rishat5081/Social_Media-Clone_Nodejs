const router = require("express").Router();
const { authenticateUserEmail } = require("../resolvers/AuthencationAPI");

router.put("/authenticateUserEmail", authenticateUserEmail);

module.exports = router;
