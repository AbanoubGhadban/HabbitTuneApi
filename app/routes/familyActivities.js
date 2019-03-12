const express = require('express');
const router = express.Router();
const FamilyActivityCtrl = require('../controllers/FamilyActivityController');
const auth = require('../middleware/auth');
const parseFromToDate = require('../middleware/parseFromToDate');

router.get('/:familyId/progress/:fromYear/:fromMonth/:fromDay/:toYear/:toMonth/:toDay', parseFromToDate(), FamilyActivityCtrl.getProgress);

module.exports = router;
