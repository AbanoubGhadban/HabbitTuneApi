const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const preparePhone = require('../middleware/preparePhone');
const request = require('../requests/UserRequest');
const {usersStorage} = require('../middleware/imageUpload');

router.get('/', auth.exceptPendings, UserController.index);
router.get('/getInfo', auth.evenBlocked, UserController.showUserInfo);
router.get('/:userId', auth.exceptPendings, UserController.show);
router.get('/phone/:phone', preparePhone('params'), UserController.showByPhone);
router.post('/', auth.onlyAdmins, request.post, preparePhone(), UserController.store);
router.put('/:userId', auth.onlyAdmins, request.update, preparePhone(), UserController.update);
router.put('/:userId/name', auth.normalOrAdmin, auth.sameUserId(), request.updateName, UserController.updateName);
router.put('/:userId/password', auth.normalOrAdmin, auth.sameUserId(), request.updatePassword, UserController.updatePassword);
router.put('/:userId/phone', auth.normalOrAdmin, auth.sameUserId(), request.updatePhone, UserController.updatePhone);
router.post('/:userId/phoneCode', auth.normalOrAdmin, auth.sameUserId(), request.getPhoneCode, preparePhone(), UserController.getPhoneCode);

router.put('/:userId/profile', auth.normalOrAdmin, auth.sameUserId(), usersStorage, UserController.setProfilePicture);
router.delete('/:userId', auth.normalOrAdmin, auth.sameUserId(), UserController.destroy);
router.post('/:userId/logoutAll', auth.allUsers, auth.sameUserId(), UserController.logout);

module.exports = router;
