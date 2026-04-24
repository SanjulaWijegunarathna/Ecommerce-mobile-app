const express = require('express');
const router = express.Router();
const {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id/reviews')
  .post(protect, createProductReview)
  .get(getProductReviews);

router.route('/:id/reviews/:reviewId')
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);

module.exports = router;
