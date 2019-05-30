const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');

router.get('/', SchoolController.index);
router.get('/alert', SchoolController.sendChildAbsenceAlert);
router.post('/sheet', parseDate(), SchoolController.createAttendanceSheet);

module.exports = router;
