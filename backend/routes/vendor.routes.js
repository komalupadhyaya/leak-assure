const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');

router.post('/', vendorController.createVendor);
router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);

module.exports = router;
