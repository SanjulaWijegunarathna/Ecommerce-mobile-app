const express = require('express');
const router = express.Router();
const { getVisuals, updateLoginImage, updateRegisterImage, updateHomeImage } = require('../controllers/visualController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getVisuals);
router.route('/login-bg').put(protect, admin, updateLoginImage);
router.route('/register-bg').put(protect, admin, updateRegisterImage);
router.route('/home-bg').put(protect, admin, updateHomeImage);

module.exports = router;
