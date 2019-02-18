const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const request = require('../requests/UserRequest');

router.get('/', UserController.index);
router.get('/:userId', UserController.show);
router.post('/', auth.onlyAdmins, request.post, UserController.store);
router.put('/:userId', auth.normalOrAdmin, auth.sameUserId(), request.update, UserController.update);

module.exports = router;
