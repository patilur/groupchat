const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authenticate = require('../middleware/auth')
const userAuthenticate = require('../middleware/auth')

router.post('/send', userAuthenticate.authenticate, chatController.sendMessage);
router.get('/messages', userAuthenticate.authenticate, chatController.getMessages);
module.exports = router;