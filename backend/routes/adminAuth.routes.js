const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuth.controller');
const adminAuth = require('../middleware/adminAuth.middleware');

// Admin Login / Logout
router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);
router.get('/me', adminAuth, adminAuthController.getMe);

module.exports = router;
