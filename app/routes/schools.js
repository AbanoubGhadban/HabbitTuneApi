const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const auth = require('../middleware/auth');
const parseDate = require('../middleware/parseDate');
const request = require('../requests/SchoolRequest');

router.get('/', auth.exceptPendings, SchoolController.index);
router.get('/alert', auth.normalOrAdmin, auth.adminOfSchool(undefined, 'query'), SchoolController.sendChildAbsenceAlert);
router.post('/sheet', auth.normalOrAdmin, auth.adminOfSchool(undefined, 'body'), parseDate(), SchoolController.createAttendanceSheet);

router.get('/:schoolId', auth.exceptPendings, SchoolController.show);
router.post('/', auth.onlyAdmins, request.store, SchoolController.store);
router.put('/:schoolId/admin', auth.onlyAdmins, request.setSchoolAdmin, SchoolController.setUserAsSchoolAdmin);
router.put('/unsetAdmin', auth.onlyAdmins, request.setSchoolAdmin, SchoolController.unSetUserAsSchoolAdmin);
router.put('/:schoolId', auth.normalOrAdmin, auth.adminOfSchool(), request.update, SchoolController.update);
router.delete('/:schoolId', auth.onlyAdmins, SchoolController.destroy);

module.exports = router;
