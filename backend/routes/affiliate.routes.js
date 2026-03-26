const express = require('express');
const router = express.Router();
const affiliateAuth = require('../middleware/affiliateAuth.middleware');
const authController = require('../controllers/affiliateAuth.controller');
const portalController = require('../controllers/affiliatePortal.controller');

// Public
router.post('/signup', authController.affiliateSignup);
router.post('/login', authController.affiliateLogin);

// Protected (affiliate auth)
router.get('/me', affiliateAuth, portalController.getMe);
router.get('/referrals', affiliateAuth, portalController.getReferrals);
router.get('/commissions', affiliateAuth, portalController.getCommissions);
router.get('/creatives', affiliateAuth, portalController.getCreatives);
router.patch('/settings', affiliateAuth, portalController.updateSettings);

module.exports = router;
