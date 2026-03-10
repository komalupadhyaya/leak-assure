const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claim.controller');
const upload = require('../services/upload.service');

router.post('/', upload.array('photos', 5), claimController.createClaim);

router.get('/', claimController.getAllClaims);
router.get('/member/:memberId', claimController.getClaimsByMember);
router.get('/:id', claimController.getClaimById);
router.patch('/:id/status', claimController.updateClaimStatus);
router.patch('/:id/vendor', claimController.assignVendor);
router.patch('/:id/notes', claimController.addNote);

module.exports = router;

