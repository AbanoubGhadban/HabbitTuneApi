const express = require('express');
const router = express.Router();
const FamilyChildCtrl = require('../controllers/FamilyChildController');
const auth = require('../middleware/auth');
const request = require('../requests/ChildRequest');

router.get('/:familyId/children', auth.exceptPendings, FamilyChildCtrl.index);
router.post('/:familyId/children', auth.normalOrAdmin, auth.parentInFamily(), request.store, FamilyChildCtrl.store);

module.exports = router;
