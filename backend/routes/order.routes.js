const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/order.controller');

const { protect, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// Routes for all authenticated users
router.route('/')
  .post(createOrder);

router.route('/myorders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

// Routes for farmers
router.route('/farmer')
  .get(authorize('farmer'), getFarmerOrders);

// Routes for order status updates (farmers and admins)
router.route('/:id/status')
  .put(authorize('farmer', 'admin'), updateOrderStatus);

module.exports = router; 