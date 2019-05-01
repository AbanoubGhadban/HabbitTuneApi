const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const request = require('../requests/UserRequest');
const {userStorage} = require('../utils/storage');
const upload = require('multer')({storage: userStorage.storageOptions});

router.get('/', UserController.index);
router.get('/getInfo', auth.evenBlocked, UserController.showUserInfo);
router.get('/:userId', UserController.show);
router.get('/phone/:phone', UserController.showByPhone);
router.post('/', auth.onlyAdmins, request.post, UserController.store);
router.put('/:userId', auth.normalOrAdmin, auth.sameUserId(), request.update, UserController.update);

router.put('/:userId/profile', upload.single('photo'), UserController.setProfilePicture);
router.delete('/:userId', auth.normalOrAdmin, auth.sameUserId(), UserController.destroy);
router.post('/:userId/logoutAll', auth.allUsers, auth.sameUserId(), UserController.logout);

module.exports = router;
