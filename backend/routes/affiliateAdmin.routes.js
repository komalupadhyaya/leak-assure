const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth.middleware');
const ctrl = require('../controllers/affiliateAdmin.controller');

// All routes require admin auth
router.use(adminAuth);

// Affiliates
router.get('/', ctrl.getAllAffiliates);
router.get('/:id', ctrl.getAffiliateDetail);
router.patch('/:id/status', ctrl.updateAffiliateStatus);
router.post('/:id/payouts', ctrl.createPayout);

// Commissions
router.patch('/commissions/:id/status', ctrl.updateCommissionStatus);
router.post('/:id/bulk-commissions', ctrl.bulkUpdateCommissions);

// Payouts
router.get('/payouts/all', ctrl.getAllPayouts);
router.patch('/payouts/:id', ctrl.markPayoutPaid);

// Creatives
router.get('/creatives/all', ctrl.getAllCreatives);
router.post('/creatives', ctrl.createCreative);
router.delete('/creatives/:id', ctrl.deleteCreative);

module.exports = router;
