const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Order creation & customer orders (Protected)
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin-only order list & status update
router.get('/', protect, adminOnly, getOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = { orderRoutes: router };

