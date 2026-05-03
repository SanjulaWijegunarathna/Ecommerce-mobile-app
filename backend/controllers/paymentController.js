const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mockdummykey123');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  // Try to find the user's cart securely on our backend rather than trusting frontend payload
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.cartItems.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Calculate amount in cents securely from backend values
  const amount = Math.round(cart.totalPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'lkr', // LKR based on app price formats (Rs. x.xx)
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = { createPaymentIntent };
