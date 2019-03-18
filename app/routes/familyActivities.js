const express = require('express');
const router = express.Router();
const FamilyActivityCtrl = require('../controllers/FamilyActivityController');
const auth = require('../middleware/auth');
const parseFromToDate = require('../middleware/parseFromToDate');

router.get('/:familyId/progress/:fromDate/:toDate', parseFromToDate(), FamilyActivityCtrl.getProgress);

module.exports = router;
