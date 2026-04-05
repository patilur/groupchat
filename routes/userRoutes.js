const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')
const userAuthenticate = require('../middleware/auth')

router.post('/addUser', userController.addEntries)
router.post('/login', userController.login);

// user routes
router.get("/user/search", userAuthenticate.authenticate, userController.searchUsers);
module.exports = router;