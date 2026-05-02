const mongoose = require('mongoose');

const deliverySchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
      unique: true, // one Delivery record per Order
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    trackingSteps: [
      {
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNote: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
