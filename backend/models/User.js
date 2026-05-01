const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    dob: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    addresses: [
      {
        label: String,
        recipient: String,
        street: String,
        city: String,
        country: String,
        isDefault: { type: Boolean, default: false }
      }
    ],
    cart: {
      type: Array,
      default: []
    },
    wishlist: {
      type: Array,
      default: []
    },
    paymentMethods: [
      {
        cardholderName: String,
        cardNumber: String,
        expiry: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
