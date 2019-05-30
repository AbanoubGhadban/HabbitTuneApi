const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const preparePhone = require('../middleware/preparePhone');
const request = require('../requests/AuthRequest');

router.post('/register', request.registration, preparePhone(), AuthController.register);
router.post('/login', request.login, preparePhone(), AuthController.login);
router.post('/childLogin', AuthController.childLogin);
router.get('/logout', auth.evenBlocked, AuthController.logout);
router.post('/refreshToken', auth.checkRefreshToken, AuthController.refreshToken);
router.post('/activate', auth.onlyPendings, request.activate, AuthController.activate);
router.get('/activationCode', auth.onlyPendings, AuthController.sendActivationCode);

router.post('/sendResetCode', request.sendResetCode, preparePhone(), AuthController.sendResetCode);
router.post('/checkResetCode', request.checkResetCode, preparePhone(), AuthController.checkResetCode);
router.post('/resetPassword', request.resetPassword, preparePhone(), AuthController.resetPassword);
router.post('/fcm', auth.evenBlocked, request.setFcmToken, AuthController.setFcmToken);

module.exports = router;
