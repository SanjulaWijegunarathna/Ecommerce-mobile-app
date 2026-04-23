const express = require('express');
const router = express.Router();
const { createInventoryItem, updateInventoryItem, getInventoryItems, getSeasonalItems } = require('../controllers/inventoryController');
const { createProductReview, getProductReviews, updateProductReview, deleteProductReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Temporarily public to allow React Native local state Admin sync without needing auth header injection right now
router.route('/').get(getInventoryItems).post(createInventoryItem);
router.route('/seasonal').get(getSeasonalItems);   // ← BEFORE /:id
router.route('/:id').put(updateInventoryItem);

// Review routes
router.route('/:id/reviews')
    .post(protect, createProductReview)
    .get(getProductReviews);

router.route('/:id/reviews/:reviewId')
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview);

module.exports = router;
