const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const userAuthenticate = require('../middleware/auth')

router.post('/send', userAuthenticate.authenticate, chatController.sendMessage);
//router.get('/messages', userAuthenticate.authenticate, chatController.getMessages);
// chat routes
router.get("/chat/:roomId", userAuthenticate.authenticate, chatController.getRoomMessages);

module.exports = router;