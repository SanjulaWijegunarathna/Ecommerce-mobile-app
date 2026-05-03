const mongoose = require('mongoose');

const cartItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  color: { type: String },
  size: { type: String },
});

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  cartItems: [cartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
}, {
  timestamps: true,
});

// Calculate total price automatically before save
cartSchema.pre('save', function (next) {
  this.totalPrice = this.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
