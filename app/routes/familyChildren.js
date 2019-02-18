const express = require('express');
const router = express.Router();
const FamilyChildCtrl = require('../controllers/FamilyChildController');
const auth = require('../middleware/auth');

router.get('/:familyId/children', auth.exceptPendings, FamilyChildCtrl.index);
router.post('/:familyId/children', auth.normalOrAdmin, auth.parentInFamily(), FamilyChildCtrl.store);

module.exports = router;
