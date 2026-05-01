const express = require('express');
const router = express.Router();
const { 
  addOrderItems, 
  getOrderById, 
  getMyOrders, 
  updateOrderStatus, 
  createOrderReview, 
  getOrders, 
  getAllReviews, 
  replyToReview, 
  deleteReview,
  getDashboardStats,
  deleteOrder,
  approvePayment
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/reviews/all').get(protect, admin, getAllReviews);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/review').post(protect, createOrderReview).delete(protect, admin, deleteReview);
router.route('/:id/review/reply').put(protect, admin, replyToReview);
router.route('/:id/approve-payment').put(protect, admin, approvePayment);

module.exports = router;
