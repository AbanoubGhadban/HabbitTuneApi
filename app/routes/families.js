const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/FamilyController');
const request = require('../requests/FamilyRequest');
const auth = require('../middleware/auth');

router.get('/:familyId', FamilyController.show);
router.put('/:familyId', auth.normalOrAdmin, auth.parentInFamily(), request.update, FamilyController.update);
router.get('/:familyId/joinCode', auth.normalOrAdmin,
             auth.parentInFamily(), FamilyController.generateJoinCode);

module.exports = router;
