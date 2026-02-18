const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/create-session', checkoutController.createSession);
router.get('/verify-session', checkoutController.verifySession);

module.exports = router;
