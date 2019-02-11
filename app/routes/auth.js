const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

router.post('/register', AuthController.register);
router.post('/refreshToken', auth.checkRefreshToken, AuthController.refreshToken);
router.post('/activate', auth.onlyPendings, AuthController.activate);
router.get('/activationCode', auth.onlyPendings, AuthController.sendActivationCode);

module.exports = router;
