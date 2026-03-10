const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Important: Webhook must use express.raw middleware to verify signature
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

router.get('/session/:sessionId', stripeController.getSessionDetails);

module.exports = router;
