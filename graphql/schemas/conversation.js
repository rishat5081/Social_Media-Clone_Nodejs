const express = require("express");
const {
  createConversation,
  getConversations,
  createGroupConversation,
  getConversationId,
} = require("../resolvers/conversation");
const router = express.Router();

router.post("/conversation", createConversation);
router.post("/grpconversation", createGroupConversation);
router.get("/conversations", getConversations);
router.post("/getConversationId", getConversationId);

module.exports = router;
