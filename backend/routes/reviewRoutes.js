const express = require('express');
const router = express.Router();
const { 
  createProductReview, 
  getProductReviews, 
  updateProductReview, 
  deleteProductReview,
  addReviewImages,
  verifyReview,
  getAllReviews,
  replyToReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin only - Get all reviews (MUST come before /product/:id)
router.get('/admin/all', protect, admin, getAllReviews);

// Public - Get all reviews for a product
router.get('/product/:id', getProductReviews);

// Protected - Create review (must be logged in)
router.post('/:id', protect, createProductReview);

// Protected - Update review (must be review owner)
router.put('/:reviewId', protect, updateProductReview);

// Protected - Add images to review (must be review owner)
router.put('/:reviewId/images', protect, addReviewImages);

// Protected - Delete review (review owner or admin)
router.delete('/:reviewId', protect, deleteProductReview);

// Admin only - Verify review
router.put('/:reviewId/verify', protect, admin, verifyReview);

// Admin only - Reply to review
router.put('/:reviewId/reply', protect, admin, replyToReview);

module.exports = router;
