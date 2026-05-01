const express = require('express');
const router = express.Router();
const { createInventoryItem, updateInventoryItem, getInventoryItems, getSeasonalItems, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET is public — any user/guest can browse products
router.route('/').get(getInventoryItems).post(protect, admin, createInventoryItem);
router.route('/seasonal').get(getSeasonalItems);   // ← BEFORE /:id
router.route('/:id').put(protect, admin, updateInventoryItem).delete(protect, admin, deleteInventoryItem);

module.exports = router;
