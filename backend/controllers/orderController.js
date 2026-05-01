const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
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
    paymentReceipt,
  } = req.body;

  console.log('Received Order Data:', JSON.stringify(req.body, null, 2));

  if (!orderItems || orderItems.length === 0) {
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
      paymentReceipt,
      status: 'Pending',
      trackingSteps: [
        { text: 'Order Placed',     isCompleted: true  },
        { text: 'Processing',       isCompleted: false },
        { text: 'Shipped',          isCompleted: false },
        { text: 'Out for Delivery', isCompleted: false },
        { text: 'Delivered',        isCompleted: false },
      ]
    });

    const createdOrder = await order.save();

    // Deduct stock from Inventory
    for (const item of orderItems) {
      const inventoryItem = await Inventory.findById(item.product);
      if (inventoryItem) {
        // Deduct overall stock
        inventoryItem.stock = Math.max(0, inventoryItem.stock - item.qty);
        
        // Deduct specific size stock if it exists
        if (inventoryItem.sizeStocks && inventoryItem.sizeStocks[item.size] !== undefined) {
          inventoryItem.sizeStocks[item.size] = Math.max(0, inventoryItem.sizeStocks[item.size] - item.qty);
          // Mongoose needs this to know Mixed type changed
          inventoryItem.markModified('sizeStocks'); 
        }
        await inventoryItem.save();
      }
    }

    // Auto-create a linked Delivery record
    await Delivery.create({
      order: createdOrder._id,
      user: req.user._id,
      status: 'Pending',
      shippingAddress: createdOrder.shippingAddress,
      trackingSteps: [
        { text: 'Order Placed',     isCompleted: true  },
        { text: 'Processing',       isCompleted: false },
        { text: 'Shipped',          isCompleted: false },
        { text: 'Out for Delivery', isCompleted: false },
        { text: 'Delivered',        isCompleted: false },
      ],
    });

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

// @desc    Update order status (also syncs Delivery record)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, stepText } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Update Order itself
  order.status = status;
  const stepIndex = order.trackingSteps.findIndex(s => s.text === stepText);
  if (stepIndex !== -1) {
    order.trackingSteps[stepIndex].isCompleted = true;
  } else if (stepText) {
    order.trackingSteps.push({ text: stepText, isCompleted: true });
  }
  const updatedOrder = await order.save();

  // Keep Delivery record in sync
  const delivery = await Delivery.findOne({ order: order._id });
  if (delivery) {
    delivery.status = status;
    if (stepText) {
      const dIdx = delivery.trackingSteps.findIndex(s => s.text === stepText);
      if (dIdx !== -1) {
        delivery.trackingSteps[dIdx].isCompleted = true;
        delivery.trackingSteps[dIdx].timestamp = new Date();
      } else {
        delivery.trackingSteps.push({ text: stepText, isCompleted: true });
      }
    }
    if (status === 'Delivered') {
      delivery.deliveredAt = new Date();
      delivery.trackingSteps.forEach(s => { s.isCompleted = true; });
    }
    await delivery.save();
  }

  res.json(updatedOrder);
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

    // Validate rating
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      res.status(400);
      throw new Error('Rating must be a number between 1 and 5.');
    }

    if (!comment || !comment.toString().trim()) {
      res.status(400);
      throw new Error('A comment is required.');
    }

    order.review = {
      rating: parsedRating,
      comment: comment.trim(),
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
    if (!reply || !reply.trim()) {
      res.status(400);
      throw new Error('Reply text is required.');
    }
    order.review.reply = reply.trim();
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

// @desc    Approve a Bank Transfer payment (Admin)
// @route   PUT /api/orders/:id/approve-payment
const approvePayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already marked as paid');
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.json(updatedOrder);
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
  deleteOrder,
  approvePayment
};
