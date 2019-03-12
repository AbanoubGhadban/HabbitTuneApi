const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/ActivityController');
const parseDate = require('../middleware/parseDate');
const auth = require('../middleware/auth');

router.get('/:year/:month/:day', parseDate(), ActivityController.index);
router.get('/', ActivityController.index);

module.exports = router;
