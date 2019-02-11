const express = require('express');
const router = express.Router();
const FamilyController = require('../controllers/FamilyController');
const auth = require('../middleware/auth');

router.post('/', auth.exceptPendings, FamilyController.store);

module.exports = router;
