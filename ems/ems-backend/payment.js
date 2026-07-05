const express = require('express');
const router = express.Router();
const { createCheckout, webhook, paymentHistory, refund } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-checkout', protect, createCheckout);
router.post('/webhook', webhook); // no auth — Stripe signs it
router.get('/history', protect, paymentHistory);
router.post('/refund', protect, refund);

module.exports = router;
