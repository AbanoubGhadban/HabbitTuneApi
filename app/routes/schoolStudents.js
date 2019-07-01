const express = require('express');
const router = express.Router();
const SchoolStudentsCtrl = require('../controllers/SchoolStudentsController');
const auth = require('../middleware/auth');
const request = require('../requests/ChildRequest');

router.get('/:schoolId/students/all', SchoolStudentsCtrl.showAll);
router.get('/:schoolId/students', SchoolStudentsCtrl.index);
router.post('/:schoolId/students/:childId/verify', SchoolStudentsCtrl.verifyStudent);
router.delete('/:schoolId/students/:childId', SchoolStudentsCtrl.destroy);

module.exports = router;
