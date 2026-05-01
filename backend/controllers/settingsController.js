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
  } else if (settings.bannerImage === '/uploads/hero-banner.jpg') {
    // Self-heal: Fix old databases that still have the local file path
    settings.bannerImage = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop';
    await settings.save();
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
