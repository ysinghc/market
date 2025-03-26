const express = require('express');
const router = express.Router();
const {
  getFarmerDashboardStats,
  getFarmerMonthlySales,
  getFarmerSalesByCrop,
  getFarmerRevenueByCustomer
} = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

// Farmer dashboard routes
router.get('/farmer', authorize('farmer'), getFarmerDashboardStats);
router.get('/farmer/monthly-sales', authorize('farmer'), getFarmerMonthlySales);
router.get('/farmer/sales-by-crop', authorize('farmer'), getFarmerSalesByCrop);
router.get('/farmer/revenue-by-customer', authorize('farmer'), getFarmerRevenueByCustomer);

module.exports = router; 