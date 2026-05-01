const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProductReview, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id').get(getProductById);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
