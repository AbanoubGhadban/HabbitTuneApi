const express = require('express');
const router = express.Router();
const UserFamilyCtrl = require('../controllers/UserFamilyController');
const auth = require('../middleware/auth');

router.post('/:userId([0-9]+)/families', auth.normalOrAdmin, auth.sameUserId(), UserFamilyCtrl.store);

module.exports = router;
