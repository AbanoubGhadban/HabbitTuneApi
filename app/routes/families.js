const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/FamilyController');
const request = require('../requests/FamilyRequest');
const auth = require('../middleware/auth');

router.get('/', FamilyController.index);
router.get('/:familyId', FamilyController.show);
router.put('/:familyId', auth.normalOrAdmin, auth.parentInFamily(), request.update, FamilyController.update);
router.delete('/:familyId', auth.normalOrAdmin, auth.parentInFamily(), FamilyController.destroy);
router.put('/:familyId/join/:userId', auth.normalOrAdmin, auth.parentInFamily(), FamilyController.addParent);
router.get('/:familyId/joinCode', auth.normalOrAdmin,
             auth.parentInFamily(), FamilyController.generateJoinCode);

module.exports = router;
