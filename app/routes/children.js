const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');
const request = require('../requests/ChildRequest');
const auth = require('../middleware/auth');

router.get('/', ChildController.index);
router.get('/:childId', ChildController.show);
router.put('/:childId', auth.normalOrAdmin, auth.parentOfChild(), request.update, ChildController.update);
router.delete('/:childId', auth.normalOrAdmin, auth.parentOfChild(), ChildController.destroy);

module.exports = router;
