const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');

router.get('/', memberController.getAllMembers);
router.post('/', memberController.createMember);
router.get('/:id', memberController.getMemberById);
router.patch('/:id', memberController.updateMember);
router.post('/:id/cancel', memberController.cancelSubscription);
router.post('/:id/note', memberController.addMemberNote);
router.post('/:id/sync-payments', memberController.syncMemberPayments);

module.exports = router;
