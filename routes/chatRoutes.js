const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');
const userAuthenticate = require('../middleware/auth')
const multer = require('multer');
const aiController = require('../controller/aiController');

router.post('/send', userAuthenticate.authenticate, chatController.sendMessage);
//router.get('/messages', userAuthenticate.authenticate, chatController.getMessages);
// chat routes
//router.get("/:roomId", userAuthenticate.authenticate, chatController.getRoomMessages);


router.post('/groups', userAuthenticate.authenticate, chatController.createGroup);
router.get('/groups', userAuthenticate.authenticate, chatController.getUserGroups);
router.get("/:roomId", userAuthenticate.authenticate, chatController.getRoomMessages);
router.post('/groups/add-member', userAuthenticate.authenticate, chatController.addMemberToGroup);

// Setup Multer to store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Route for media sharing
router.post('/upload', userAuthenticate.authenticate, upload.single('file'), chatController.shareMedia);


// --- AI Integration Routes ---
// Route for Predictive Typing (Next word suggestions)
router.post('/ai/predict', userAuthenticate.authenticate, aiController.getPredictiveText);

// Route for Smart Replies (Quick response buttons)
router.post('/ai/replies', userAuthenticate.authenticate, aiController.getSmartReplies);

module.exports = router;