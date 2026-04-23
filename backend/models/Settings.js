const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema(
  {
    bannerTitle: {
      type: String,
      default: 'SPRING / SUMMER 2026',
    },
    bannerSubtitle: {
      type: String,
      default: 'The Summer Collection',
    },
    bannerImage: {
      type: String,
      default: '/uploads/hero-banner.jpg',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
