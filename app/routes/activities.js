const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/ActivityController');
const parseDate = require('../middleware/parseDate');
const auth = require('../middleware/auth');

router.get('/:year/:month/:day', auth.exceptPendings, parseDate(), ActivityController.index);
router.get('/', auth.exceptPendings, ActivityController.index);

module.exports = router;
