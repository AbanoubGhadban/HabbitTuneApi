const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');
const request = require('../requests/ChildRequest');
const auth = require('../middleware/auth');
const {childStorage} = require('../utils/storage');
const upload = require('multer')({storage: childStorage.storageOptions});

router.get('/', ChildController.index);
router.get('/:childId', ChildController.show);
router.put('/:childId', auth.normalOrAdmin, auth.parentOfChild(), request.update, ChildController.update);

router.put('/:childId/profile', upload.single('photo'), ChildController.setProfilePicture);
router.delete('/:childId', auth.normalOrAdmin, auth.parentOfChild(), ChildController.destroy);
router.post('/:childId/logoutAll', auth.exceptPendings, auth.parentOfChild(), ChildController.logout);
router.get('/:childId/loginCode', auth.exceptPendings, auth.parentOfChild(), ChildController.generateLoginCode);

module.exports = router;
