const express = require('express');
const router = express.Router();
const ChildController = require('../controllers/ChildController');
const request = require('../requests/ChildRequest');
const auth = require('../middleware/auth');

router.get('/', ChildController.index);
router.get('/:childId', ChildController.show);
router.put('/:childId', auth.normalOrAdmin, auth.parentOfChild(), request.update, ChildController.update);
router.delete('/:childId', auth.normalOrAdmin, auth.parentOfChild(), ChildController.destroy);
router.post('/:childId/logoutAll', auth.exceptPendings, auth.parentOfChild(), ChildController.logout);
router.get('/:childId/loginCode', auth.exceptPendings, auth.parentOfChild(), ChildController.generateLoginCode);

module.exports = router;
