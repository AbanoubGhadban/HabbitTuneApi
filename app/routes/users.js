const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const request = require('../requests/UserRequest');

router.get('/', UserController.index);
router.post('/', auth.onlyAdmins, request.post, UserController.store);
router.put('/:userId([0-9]+)', auth.normalOrAdmin, auth.sameUserId(), UserController.update);

module.exports = router;
