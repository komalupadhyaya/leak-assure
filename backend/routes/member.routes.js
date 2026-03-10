const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.patch('/:id', memberController.updateMember);
router.post('/:id/cancel', memberController.cancelSubscription);
router.post('/:id/note', memberController.addMemberNote);

module.exports = router;
