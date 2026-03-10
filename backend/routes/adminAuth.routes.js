const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuth.controller');

// Admin Login
router.post('/login', adminAuthController.login);

module.exports = router;
