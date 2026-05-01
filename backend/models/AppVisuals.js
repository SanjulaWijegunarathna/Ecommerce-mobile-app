const mongoose = require('mongoose');

const appVisualsSchema = mongoose.Schema(
  {
    loginBackgroundImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    },
    registerBackgroundImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    },
    homeBackgroundImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2069&auto=format&fit=crop',
    },
  },
  {
    timestamps: true,
  }
);

const AppVisuals = mongoose.model('AppVisuals', appVisualsSchema);

module.exports = AppVisuals;
