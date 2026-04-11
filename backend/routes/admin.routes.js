const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

router.get('/dashboard', adminController.getDashboardStats);
router.post('/admin-users', adminController.createAdminUser);
router.post('/members/:memberId/reset-password', adminController.resetMemberPassword);

module.exports = router;
