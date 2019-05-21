const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/AttendanceController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');

router.get('/:schoolId/:date([0-9]{8})', parseDate(), AttendanceController.index);
router.post('/:schoolId/:childId', AttendanceController.store);

module.exports = router;
