const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const authenticate = require('../middleware/auth');

router.post('/send', authenticate, chatController.sendMessage);



module.exports = router;