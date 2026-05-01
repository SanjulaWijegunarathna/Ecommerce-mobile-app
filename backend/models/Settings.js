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
      default: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
