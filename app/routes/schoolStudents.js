const express = require('express');
const router = express.Router();
const SchoolStudentsCtrl = require('../controllers/SchoolStudentsController');
const auth = require('../middleware/auth');
const request = require('../requests/ChildRequest');

router.get('/:schoolId/students/all', auth.normalOrAdmin, auth.adminOfSchool(), SchoolStudentsCtrl.showAll);
router.get('/:schoolId/students', auth.normalOrAdmin, auth.adminOfSchool(), SchoolStudentsCtrl.index);
router.post('/:schoolId/students/:childId/verify', auth.normalOrAdmin, auth.adminOfSchool(), SchoolStudentsCtrl.verifyStudent);
router.delete('/:schoolId/students/:childId', auth.normalOrAdmin, auth.adminOfSchool(), SchoolStudentsCtrl.destroy);

module.exports = router;
