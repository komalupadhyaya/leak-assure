const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const stripeController = require('../controllers/stripe.controller');
const auth = require('../middleware/auth.middleware');

router.get('/me', auth, memberController.getMe);
router.post('/claim', auth, memberController.memberFileClaim);
router.post('/cancel', auth, memberController.memberCancelSubscription);
router.post('/billing-portal', auth, stripeController.createBillingPortal);

module.exports = router;

