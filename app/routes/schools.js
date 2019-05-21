const express = require('express');
const router = express.Router();
const SchoolController = require('../controllers/SchoolController');
const auth = require('../middleware/auth');

router.get('/', SchoolController.index);

module.exports = router;
