const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Credit Card',
    },
    paymentReceipt: {
      type: String,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    trackingSteps: [
      {
        text: String,
        timestamp: { type: Date, default: Date.now },
        isCompleted: { type: Boolean, default: false },
      }
    ],
    review: {
      rating: { type: Number },
      comment: { type: String },
      reply: { type: String },
      repliedAt: { type: Date },
      images: [String],
      createdAt: { type: Date },
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
