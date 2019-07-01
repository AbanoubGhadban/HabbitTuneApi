const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');
const request = require('../requests/SchoolRequest');

router.get('/', SchoolController.index);
router.get('/alert', SchoolController.sendChildAbsenceAlert);
router.post('/sheet', parseDate(), SchoolController.createAttendanceSheet);

router.get('/:schoolId', SchoolController.show);
router.post('/', request.store, SchoolController.store);
router.put('/:schoolId/admin', request.setSchoolAdmin, SchoolController.setUserAsSchoolAdmin);
router.put('/unsetAdmin', request.setSchoolAdmin, SchoolController.unSetUserAsSchoolAdmin);
router.put('/:schoolId', request.update, SchoolController.update);
router.delete('/:schoolId', SchoolController.destroy);

module.exports = router;
