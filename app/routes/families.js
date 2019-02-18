const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/FamilyController');
const auth = require('../middleware/auth');

router.get('/:familyId/joinCode', auth.normalOrAdmin,
             auth.parentInFamily(), FamilyController.generateJoinCode);

module.exports = router;
