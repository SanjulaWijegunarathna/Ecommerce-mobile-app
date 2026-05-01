const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart);
router.route('/add').post(protect, addToCart);
router.route('/:itemId').delete(protect, removeFromCart);

module.exports = router;
