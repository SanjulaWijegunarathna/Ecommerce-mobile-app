const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    // Initialize if doesn't exist
    settings = await Settings.create({});
  }
  
  res.json(settings);
});

// @desc    Update banner settings
// @route   PUT /api/settings/banner
// @access  Private/Admin
const updateBannerSettings = asyncHandler(async (req, res) => {
  const { title, subtitle, image } = req.body;
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = new Settings();
  }
  
  settings.bannerTitle = title || settings.bannerTitle;
  settings.bannerSubtitle = subtitle || settings.bannerSubtitle;
  settings.bannerImage = image || settings.bannerImage;
  
  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

module.exports = { getSettings, updateBannerSettings };
