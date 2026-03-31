const express = require('express');
const router = express.Router();
const userController = require('../controller/userController')

router.post('/addUser', userController.addEntries)
router.post('/login', userController.login);

module.exports = router;