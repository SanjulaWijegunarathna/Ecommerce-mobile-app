const asyncHandler = require('express-async-handler');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

// Helper — default tracking steps for a new order
const defaultTrackingSteps = () => [
  { text: 'Order Placed',     isCompleted: true  },
  { text: 'Processing',       isCompleted: false },
  { text: 'Shipped',          isCompleted: false },
  { text: 'Out for Delivery', isCompleted: false },
  { text: 'Delivered',        isCompleted: false },
];

// ─────────────────────────────────────────────────────────────────
// @desc    Create a delivery record for a new order
// @route   POST /api/delivery
// @access  Private
// ─────────────────────────────────────────────────────────────────
const createDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Prevent duplicate delivery records
  const existing = await Delivery.findOne({ order: orderId });
  if (existing) {
    return res.status(200).json(existing);
  }

  const delivery = await Delivery.create({
    order: order._id,
    user: order.user,
    status: order.status || 'Pending',
    shippingAddress: order.shippingAddress,
    trackingSteps: defaultTrackingSteps(),
  });

  res.status(201).json(delivery);
});

// ─────────────────────────────────────────────────────────────────
// @desc    Get delivery info by Order ID
// @route   GET /api/delivery/order/:orderId
// @access  Private
// ─────────────────────────────────────────────────────────────────
const getDeliveryByOrderId = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findOne({ order: req.params.orderId })
    .populate('order', 'orderItems totalPrice paymentMethod createdAt')
    .populate('user', 'name email');

  if (!delivery) {
    res.status(404);
    throw new Error('Delivery record not found for this order');
  }

  res.json(delivery);
});

// ─────────────────────────────────────────────────────────────────
// @desc    Get all delivery records  (admin)
// @route   GET /api/delivery
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────
const getAllDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({})
    .populate('order', 'orderItems totalPrice paymentMethod createdAt')
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });

  res.json(deliveries);
});

// ─────────────────────────────────────────────────────────────────
// @desc    Update delivery status + tracking step  (admin)
// @route   PUT /api/delivery/:id/status
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────
const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, stepText, trackingNote } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery record not found');
  }

  // Update status
  delivery.status = status;

  // Update tracking note if provided
  if (trackingNote !== undefined) {
    delivery.trackingNote = trackingNote;
  }

  // Mark the matching tracking step as completed
  if (stepText) {
    const stepIndex = delivery.trackingSteps.findIndex(s => s.text === stepText);
    if (stepIndex !== -1) {
      delivery.trackingSteps[stepIndex].isCompleted = true;
      delivery.trackingSteps[stepIndex].timestamp = new Date();
    } else {
      delivery.trackingSteps.push({ text: stepText, isCompleted: true });
    }
  }

  // If delivered, stamp the date
  if (status === 'Delivered') {
    delivery.deliveredAt = new Date();
    // Mark all steps completed
    delivery.trackingSteps.forEach(s => { s.isCompleted = true; });
  }

  // Sync status back to the Order model too
  await Order.findByIdAndUpdate(delivery.order, {
    status,
    trackingSteps: delivery.trackingSteps,
  });

  const updatedDelivery = await delivery.save();
  res.json(updatedDelivery);
});

// ─────────────────────────────────────────────────────────────────
// @desc    Update estimated delivery date  (admin)
// @route   PUT /api/delivery/:id/eta
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────
const updateEstimatedDate = asyncHandler(async (req, res) => {
  const { estimatedDeliveryDate } = req.body;

  if (!estimatedDeliveryDate || isNaN(new Date(estimatedDeliveryDate).getTime())) {
    res.status(400);
    throw new Error('A valid estimated delivery date is required');
  }

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery record not found');
  }

  delivery.estimatedDeliveryDate = estimatedDeliveryDate;
  const updated = await delivery.save();
  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────
// @desc    Delete delivery record  (admin)
// @route   DELETE /api/delivery/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────
const deleteDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery record not found');
  }

  await Delivery.deleteOne({ _id: delivery._id });
  res.json({ message: 'Delivery record removed' });
});

module.exports = {
  createDelivery,
  getDeliveryByOrderId,
  getAllDeliveries,
  updateDeliveryStatus,
  updateEstimatedDate,
  deleteDelivery,
};
