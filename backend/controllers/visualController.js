const asyncHandler = require('express-async-handler');
const AppVisuals = require('../models/AppVisuals');

// @desc    Get app visuals
// @route   GET /api/visuals
// @access  Public
const getVisuals = asyncHandler(async (req, res) => {
  let visuals = await AppVisuals.findOne();
  
  if (!visuals) {
    visuals = await AppVisuals.create({});
  }
  
  res.json(visuals);
});

// @desc    Update login background image
// @route   PUT /api/visuals/login-bg
// @access  Public (for now)
const updateLoginImage = asyncHandler(async (req, res) => {
  const { loginBackgroundImage } = req.body;
  let visuals = await AppVisuals.findOne();
  
  if (!visuals) {
    visuals = new AppVisuals();
  }
  
  if (loginBackgroundImage) {
    visuals.loginBackgroundImage = loginBackgroundImage;
  }
  
  const updatedVisuals = await visuals.save();
  res.json(updatedVisuals);
});

const updateRegisterImage = asyncHandler(async (req, res) => {
  const { registerBackgroundImage } = req.body;
  let visuals = await AppVisuals.findOne();
  
  if (!visuals) {
    visuals = new AppVisuals();
  }
  
  if (registerBackgroundImage) {
    visuals.registerBackgroundImage = registerBackgroundImage;
  }
  
  const updatedVisuals = await visuals.save();
  res.json(updatedVisuals);
});

const updateHomeImage = asyncHandler(async (req, res) => {
  const { homeBackgroundImage } = req.body;
  let visuals = await AppVisuals.findOne();
  
  if (!visuals) {
    visuals = new AppVisuals();
  }
  
  if (homeBackgroundImage) {
    visuals.homeBackgroundImage = homeBackgroundImage;
  }
  
  const updatedVisuals = await visuals.save();
  res.json(updatedVisuals);
});

module.exports = { getVisuals, updateLoginImage, updateRegisterImage, updateHomeImage };
