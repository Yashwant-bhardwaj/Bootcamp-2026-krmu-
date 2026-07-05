const express = require('express');
const router = express.Router();
const { getAllUsers, banUser, getAnalytics, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly); // all routes below require admin

router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);

module.exports = router;
