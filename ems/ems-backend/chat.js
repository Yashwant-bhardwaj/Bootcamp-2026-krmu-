const express = require('express');
const router = express.Router();
const { getRoomMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:room', protect, getRoomMessages);

module.exports = router;
