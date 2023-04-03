const express = require('express');
const { createMessage, getMessagesByConversation } = require('../resolvers/message');
const router = express.Router()




router.post('/message' , createMessage)
router.get('/messages' , getMessagesByConversation)


module.exports = router