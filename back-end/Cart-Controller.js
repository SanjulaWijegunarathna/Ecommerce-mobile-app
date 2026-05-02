const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, cartItems: [] });
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, name, image, price, qty, color, size } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, cartItems: [] });
  }

  const existingItemIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === productId && item.color === color && item.size === size
  );

  if (existingItemIndex >= 0) {
    cart.cartItems[existingItemIndex].qty += Number(qty);
  } else {
    cart.cartItems.push({ product: productId, name, image, price, qty, color, size });
  }

  const updatedCart = await cart.save();
  res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.cartItems = cart.cartItems.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

module.exports = { getCart, addToCart, removeFromCart };
