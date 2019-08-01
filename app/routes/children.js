const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');
const request = require('../requests/ChildRequest');
const auth = require('../middleware/auth');
const {childrenStorage} = require('../middleware/imageUpload');

router.get('/', auth.exceptPendings, ChildController.index);
router.get('/:childId', auth.exceptPendings, ChildController.show);
router.put('/:childId', auth.normalOrAdmin, auth.parentOfChild(), request.update, ChildController.update);

router.put('/:childId/profile', auth.exceptPendings, auth.childOrHisParent(), childrenStorage, ChildController.setProfilePicture);
router.put('/:childId/school', auth.normalOrAdmin, auth.parentOfChild(), request.updateSchool, ChildController.updateSchool);
router.delete('/:childId', auth.normalOrAdmin, auth.parentOfChild(), ChildController.destroy);
router.post('/:childId/logoutAll', auth.exceptPendings, auth.parentOfChild(), ChildController.logout);
router.get('/:childId/loginCode', auth.exceptPendings, auth.parentOfChild(), ChildController.generateLoginCode);

module.exports = router;
