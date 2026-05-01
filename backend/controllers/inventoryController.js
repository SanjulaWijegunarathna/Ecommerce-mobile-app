const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Public (for development sync)
const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.create(req.body);
  res.status(201).json(item);
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Public
const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (item) {
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } else {
    // Fallback if ID is a mock ID from frontend state
    const newItem = await Inventory.create(req.body);
    res.status(201).json(newItem);
  }
});

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
const getInventoryItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({});
  res.json(items);
});

// @desc    Get seasonal items only
// @route   GET /api/inventory/seasonal
// @access  Public
const getSeasonalItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find({ isSeasonal: true }).sort({ createdAt: -1 });
  res.json(items);
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Public (for development sync)
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (item) {
    await Inventory.deleteOne({ _id: item._id });
    res.json({ message: 'Item removed successfully' });
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

module.exports = { createInventoryItem, updateInventoryItem, getInventoryItems, getSeasonalItems, deleteInventoryItem };
