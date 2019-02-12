const express = require('express');
const router = express.Router();
const UserFamilyCtrl = require('../controllers/UserFamilyController');
const auth = require('../middleware/auth');
const request = require('../requests/FamilyRequest');

router.post('/:userId([0-9]+)/families', auth.normalOrAdmin, auth.sameUserId(), request.store, UserFamilyCtrl.store);
router.post('/:userId([0-9]+)/families/join', auth.normalOrAdmin, auth.sameUserId(), UserFamilyCtrl.join);

module.exports = router;
