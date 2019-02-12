const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const request = require('../requests/AuthRequest');

router.post('/register', request.registration, AuthController.register);
router.post('/login', request.login, AuthController.login);
router.get('/logout', auth.evenBlocked, AuthController.logout);
router.post('/refreshToken', auth.checkRefreshToken, AuthController.refreshToken);
router.post('/activate', auth.onlyPendings, AuthController.activate);
router.get('/activationCode', auth.onlyPendings, AuthController.sendActivationCode);

module.exports = router;
