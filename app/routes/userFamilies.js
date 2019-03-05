const express = require('express');
const router = express.Router();
const UserFamilyCtrl = require('../controllers/UserFamilyController');
const auth = require('../middleware/auth');
const request = require('../requests/FamilyRequest');

router.get('/:userId/families', auth.exceptPendings, UserFamilyCtrl.index);
router.post('/:userId/families', auth.normalOrAdmin, auth.sameUserId(), request.store, UserFamilyCtrl.store);
router.post('/:userId/families/join', auth.normalOrAdmin, auth.sameUserId(), UserFamilyCtrl.join);
router.post('/:userId/families/:familyId/leave', auth.normalOrAdmin, auth.sameUserId(), auth.parentInFamily(), UserFamilyCtrl.leave);

module.exports = router;
