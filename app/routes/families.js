const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/FamilyController');
const request = require('../requests/FamilyRequest');
const auth = require('../middleware/auth');
const {familyStorage} = require('../utils/storage');
const upload = require('multer')({storage: familyStorage.storageOptions});

router.get('/', FamilyController.index);
router.get('/:familyId', FamilyController.show);
router.put('/:familyId', auth.normalOrAdmin, auth.parentInFamily(), request.update, FamilyController.update);

router.put('/:familyId/profile', upload.single('photo'), FamilyController.setProfilePicture);
router.delete('/:familyId', auth.normalOrAdmin, auth.parentInFamily(), FamilyController.destroy);
router.put('/:familyId/join/:userId', auth.normalOrAdmin, auth.parentInFamily(), FamilyController.addParent);
router.get('/:familyId/joinCode', auth.normalOrAdmin,
             auth.parentInFamily(), FamilyController.generateJoinCode);

module.exports = router;
