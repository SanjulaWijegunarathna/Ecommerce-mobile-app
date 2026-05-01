const Review = require('../models/Review');
const asyncHandler = require('express-async-handler');

// @desc    Add review to product with images
// @route   POST /api/products/:id/reviews
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const productId = req.params.id;

  console.log('--- New Review Submission ---');
  console.log('Product ID:', productId);
  console.log('User ID:', req.user._id);
  console.log('Data:', { rating, comment, imagesCount: images?.length || 0 });

  // ── Validation ────────────────────────────────────────────────────────────
  const parsedRating = Number(rating);
  if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5.');
  }

  if (!comment || !comment.trim()) {
    res.status(400);
    throw new Error('A comment is required to submit a review.');
  }

  if (images && images.length > 3) {
    res.status(400);
    throw new Error('A maximum of 3 images are allowed per review.');
  }
  // ─────────────────────────────────────────────────────────────────────────

  const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });

  if (alreadyReviewed) {
    console.log('Review already exists for this user/product');
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = new Review({
    name: req.user.name,
    rating: parsedRating,
    comment: comment.trim(),
    user: req.user._id,
    product: productId,
    images: images || [],
    isVerified: false
  });

  await review.save();
  await review.populate('user', 'name email profileImage');
  
  console.log('Review saved successfully');
  res.status(201).json(review);
});

// @desc    Get all reviews for a product - PUBLIC ACCESS
// @route   GET /api/products/:id/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  console.log(`Fetching reviews for Product: ${req.params.id}`);
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name email profileImage')
    .sort({ createdAt: -1 });
  console.log(`Found ${reviews.length} reviews`);
  res.json(reviews);
});

// @desc    Get all reviews - for admin dashboard
// @route   GET /api/reviews/all
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email profileImage')
    .populate('product', 'name')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc    Update a review
// @route   PUT /api/products/:id/reviews/:reviewId
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const review = await Review.findById(req.params.reviewId);

  if (review) {
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this review');
    }

    // ── Validation ────────────────────────────────────────────────────────
    if (rating !== undefined) {
      const parsedRating = Number(rating);
      if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
        res.status(400);
        throw new Error('Rating must be a number between 1 and 5.');
      }
      review.rating = parsedRating;
    }

    if (comment !== undefined && !comment.trim()) {
      res.status(400);
      throw new Error('Comment cannot be empty.');
    }

    if (images && images.length > 3) {
      res.status(400);
      throw new Error('A maximum of 3 images are allowed per review.');
    }
    // ─────────────────────────────────────────────────────────────────────

    review.comment = comment?.trim() || review.comment;
    if (images) {
      review.images = images;
    }

    const updatedReview = await review.save();
    await updatedReview.populate('user', 'name email profileImage');
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// @desc    Add images to existing review
// @route   PUT /api/reviews/:reviewId/images
const addReviewImages = asyncHandler(async (req, res) => {
  const { images } = req.body;
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review');
  }

  if (!images || !Array.isArray(images)) {
    res.status(400);
    throw new Error('Images must be an array');
  }

  // Enforce 3-image cap across existing + new images
  const combined = [...(review.images || []), ...images];
  if (combined.length > 3) {
    res.status(400);
    throw new Error(`You can only have 3 images per review. You already have ${review.images.length}.`);
  }

  review.images = combined;
  const updatedReview = await review.save();
  await updatedReview.populate('user', 'name email profileImage');
  
  res.json(updatedReview);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId or DELETE /api/products/:id/reviews/:reviewId
const deleteProductReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId || req.params.id;
  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Allow user to delete own review or admin to delete any review
  if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  await Review.findByIdAndDelete(reviewId);
  res.json({ message: 'Review removed successfully' });
});

// @desc    Verify/Approve review (Admin only)
// @route   PUT /api/reviews/:reviewId/verify
const verifyReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isVerified = true;
  const updatedReview = await review.save();
  await updatedReview.populate('user', 'name email profileImage');
  
  res.json(updatedReview);
});

// @desc    Admin reply to a review
// @route   PUT /api/reviews/:reviewId/reply
const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.adminReply = reply || '';
  review.repliedAt = reply ? new Date() : null;
  const updatedReview = await review.save();
  await updatedReview.populate('user', 'name email profileImage');
  await updatedReview.populate('product', 'name');

  res.json(updatedReview);
});

module.exports = { 
  createProductReview, 
  getProductReviews, 
  updateProductReview, 
  deleteProductReview,
  addReviewImages,
  verifyReview,
  getAllReviews,
  replyToReview
};
