const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/', adminController.admin);
router.get('/customers', adminController.getCustomers);

module.exports = router;
