const express = require('express');
const router = express.Router();
const { getSettings, updateBannerSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getSettings);
router.route('/banner').put(protect, admin, updateBannerSettings);

module.exports = router;
