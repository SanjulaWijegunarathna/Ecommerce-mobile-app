const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add review to a product
// @route   POST /api/inventory/:id/reviews
// @access  Private (logged-in user)
// ─────────────────────────────────────────────────────────────────────────────
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, image } = req.body;
  const productId = req.params.id;

  console.log('--- New Review Submission ---');
  console.log('Product ID:', productId);
  console.log('User ID:', req.user._id);
  console.log('Rating:', rating);

  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    product: productId,
  });

  if (alreadyReviewed) {
    console.log('Review already exists for this user/product');
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = new Review({
    name:    req.user.name,
    rating:  Number(rating),
    comment,
    image,    // Stores base64 string from MongoDB
    user:    req.user._id,
    product: productId,
  });

  await review.save();
  console.log('Review saved successfully:', review._id);
  res.status(201).json({ message: 'Review added', review });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all reviews for a single product
// @route   GET /api/inventory/:id/reviews
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const getProductReviews = asyncHandler(async (req, res) => {
  console.log(`Fetching reviews for Product: ${req.params.id}`);
  const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
  console.log(`Found ${reviews.length} reviews`);
  res.json(reviews);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a review (owner only)
// @route   PUT /api/inventory/:id/reviews/:reviewId
// @access  Private (owner)
// ─────────────────────────────────────────────────────────────────────────────
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, image } = req.body;
  const reviewId = req.params.reviewId || req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  review.rating  = Number(rating);
  review.comment = comment;
  if (image !== undefined) review.image = image;

  const updatedReview = await review.save();
  res.json(updatedReview);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a review 
// @route   DELETE /api/inventory/:id/reviews/:reviewId  (user – own review)
// @route   DELETE /api/reviews/admin/:reviewId          (admin)
// @access  Private (owner OR admin)
// ─────────────────────────────────────────────────────────────────────────────
const deleteProductReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId || req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  // Image is stored in MongoDB, no cleanup needed
  await review.deleteOne();
  console.log('Review deleted:', review._id);
  res.json({ message: 'Review removed' });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get ALL reviews across all products (Admin dashboard)
// @route   GET /api/reviews/all
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email')           // Show customer name + email
    .populate('product', 'name images')       // Show product name + images
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin reply to a customer review
// @route   PUT /api/reviews/:reviewId/reply
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const replyToProductReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.reply     = reply;
  review.repliedAt = new Date();
  const updatedReview = await review.save();
  res.json(updatedReview);
});

module.exports = {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  getAllProductReviews,
  replyToProductReview,
};