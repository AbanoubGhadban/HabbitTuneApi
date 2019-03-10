const express = require('express');
const router = express.Router();
const ChildActivityCtrl = require('../controllers/ChildActivityController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');
const parseFromToDate = require('../middleware/parseFromToDate');

router.get('/:childId/activities/:year/:month/:day', auth.exceptPendings, parseDate(), ChildActivityCtrl.show);
router.post('/:childId/activities/:year/:month/:day', auth.normalOrAdmin, auth.parentOfChild(), parseDate(), ChildActivityCtrl.store);
router.get('/:childId/progress/:fromYear/:fromMonth/:fromDay/:toYear/:toMonth/:toDay',
 auth.exceptPendings, parseFromToDate(), ChildActivityCtrl.getProgress);

module.exports = router;
