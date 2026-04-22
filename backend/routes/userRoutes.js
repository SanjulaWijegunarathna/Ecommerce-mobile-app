const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  getUsers,
  updateUserStatus
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers);

router.post('/login', authUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

module.exports = router;
