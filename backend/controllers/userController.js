const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isActive === false) {
      res.status(401);
      throw new Error('Your account has been disabled. Please contact support.');
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      profileImage: user.profileImage || '',
      isAdmin: user.isAdmin,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      addresses: user.addresses || [],
      paymentMethods: user.paymentMethods || [],
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email.toLowerCase();

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      profileImage: user.profileImage || '',
      isAdmin: user.isAdmin,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      addresses: [],
      paymentMethods: [],
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate with Social Provider (Simulated)
// @route   POST /api/users/social
const socialAuth = asyncHandler(async (req, res) => {
  const { name, provider } = req.body;
  const email = req.body.email.toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  let user = await User.findOne({ email });

  if (user) {
    // User exists, log them in immediately
    if (user.isActive === false) {
      res.status(401);
      throw new Error('Your account has been disabled. Please contact support.');
    }
  } else {
    // User doesn't exist, create account automatically
    const defaultName = name || `User ${Math.floor(1000 + Math.random() * 9000)}`;
    // Generate a secure random password for the social account since they login via provider
    const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    
    user = await User.create({ name: defaultName, email, password: randomPassword });
    
    if (!user) {
      res.status(400);
      throw new Error('Failed to create account via social login');
    }
  }

  // Return token
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dob: user.dob,
    profileImage: user.profileImage || '',
    isAdmin: user.isAdmin,
    cart: user.cart || [],
    wishlist: user.wishlist || [],
    addresses: user.addresses || [],
    paymentMethods: user.paymentMethods || [],
    token: generateToken(user._id),
    socialProvider: provider,
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      profileImage: user.profileImage || '',
      isAdmin: user.isAdmin,
      cart: user.cart || [],
      wishlist: user.wishlist || [],
      addresses: user.addresses || [],
      paymentMethods: user.paymentMethods || [],
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.dob !== undefined) user.dob = req.body.dob;
    if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.body.addresses) {
      user.addresses = req.body.addresses;
    }

    if (req.body.paymentMethods) {
      user.paymentMethods = req.body.paymentMethods;
    }

    if (req.body.cart !== undefined) {
      user.cart = req.body.cart;
    }

    if (req.body.wishlist !== undefined) {
      user.wishlist = req.body.wishlist;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dob: updatedUser.dob,
      profileImage: updatedUser.profileImage || '',
      isAdmin: updatedUser.isAdmin,
      cart: updatedUser.cart || [],
      wishlist: updatedUser.wishlist || [],
      addresses: updatedUser.addresses,
      paymentMethods: updatedUser.paymentMethods,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Update user status (activate/disable)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();
    res.json({ message: `User account ${user.isActive ? 'activated' : 'disabled'} successfully` });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  getUsers,
  updateUserStatus,
  socialAuth
};
