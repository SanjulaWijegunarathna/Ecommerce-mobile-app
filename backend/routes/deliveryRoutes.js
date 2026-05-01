const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getDeliveryByOrderId,
  getAllDeliveries,
  updateDeliveryStatus,
  updateEstimatedDate,
  deleteDelivery,
} = require('../controllers/deliveryController');
const { protect, admin } = require('../middleware/authMiddleware');

// POST   /api/delivery              → create delivery record for an order (auto-called after order placed)
router.post('/', protect, createDelivery);

// GET    /api/delivery              → get all deliveries (admin)
router.get('/', protect, admin, getAllDeliveries);

// GET    /api/delivery/order/:orderId  → get delivery for a specific order (user/admin)
router.get('/order/:orderId', protect, getDeliveryByOrderId);

// PUT    /api/delivery/:id/status   → update status + tracking step (admin)
router.put('/:id/status', protect, admin, updateDeliveryStatus);

// PUT    /api/delivery/:id/eta      → update estimated delivery date (admin)
router.put('/:id/eta', protect, admin, updateEstimatedDate);

// DELETE /api/delivery/:id          → delete delivery record (admin)
router.delete('/:id', protect, admin, deleteDelivery);

module.exports = router;
