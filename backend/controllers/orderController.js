const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create new order
// @route   POST /api/orders
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  console.log('Received Order Data:', JSON.stringify(req.body, null, 2));

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: 'Pending',
      trackingSteps: [
        { text: 'Order Placed', isCompleted: true },
        { text: 'Processing', isCompleted: false },
        { text: 'Shipped', isCompleted: false },
        { text: 'Delivered', isCompleted: false },
      ]
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to delete this order');
    }
    
    if (order.status !== 'Pending') {
      res.status(400);
      throw new Error('Can only delete orders that are pending processing');
    }

    await Order.deleteOne({ _id: order._id });
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, stepText } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    const stepIndex = order.trackingSteps.findIndex(s => s.text === stepText);
    if (stepIndex !== -1) {
      order.trackingSteps[stepIndex].isCompleted = true;
    } else {
      order.trackingSteps.push({ text: stepText, isCompleted: true });
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Submit order review
// @route   POST /api/orders/:id/review
const createOrderReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status !== 'Delivered') {
      res.status(400);
      throw new Error('Review can only be submitted for delivered orders');
    }

    order.review = {
      rating: Number(rating),
      comment,
      images,
      createdAt: new Date(),
    };

    const updatedOrder = await order.save();
    res.status(201).json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name email phone').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all reviews
// @route   GET /api/orders/reviews/all
const getAllReviews = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'review.rating': { $exists: true } }).populate('user', 'name email').sort({ 'review.createdAt': -1 });
  res.json(orders);
});

// @desc    Reply to a review
// @route   PUT /api/orders/:id/review/reply
const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const order = await Order.findById(req.params.id);

  if (order && order.review) {
    order.review.reply = reply;
    order.review.repliedAt = new Date();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order or Review not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/orders/:id/review
const deleteReview = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.review = undefined;
    await order.save();
    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get dashboard stats
// @route   GET /api/orders/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const orders = await Order.find({});
  const users = await User.find({});

  const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;

  res.json({
    revenue: totalRevenue,
    orders: totalOrders,
    customers: totalCustomers
  });
});

module.exports = { 
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
  deleteOrder
};
