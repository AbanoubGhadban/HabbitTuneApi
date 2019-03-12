const express = require('express');
const router = express.Router();
const ChildActivityCtrl = require('../controllers/ChildActivityController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');
const parseFromToDate = require('../middleware/parseFromToDate');

router.get('/:childId/activities/:date', auth.exceptPendings, parseDate(), ChildActivityCtrl.show);
router.post('/:childId/activities/:date', auth.normalOrAdmin, auth.parentOfChild(), parseDate(), ChildActivityCtrl.store);
router.get('/:childId/progress/:fromDate/:toDate',
 auth.exceptPendings, parseFromToDate(), ChildActivityCtrl.getProgress);

module.exports = router;
