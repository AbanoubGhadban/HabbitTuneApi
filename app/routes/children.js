const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');
const request = require('../requests/ChildRequest');
const auth = require('../middleware/auth');
const {childrenStorage} = require('../middleware/imageUpload');

router.get('/', ChildController.index);
router.get('/:childId', ChildController.show);
router.put('/:childId', auth.normalOrAdmin, auth.parentOfChild(), request.update, ChildController.update);

router.put('/:childId/profile', childrenStorage, ChildController.setProfilePicture);
router.put('/:childId/school', request.updateSchool, ChildController.updateSchool);
router.delete('/:childId', auth.normalOrAdmin, auth.parentOfChild(), ChildController.destroy);
router.post('/:childId/logoutAll', auth.exceptPendings, auth.parentOfChild(), ChildController.logout);
router.get('/:childId/loginCode', auth.exceptPendings, auth.parentOfChild(), ChildController.generateLoginCode);

module.exports = router;
