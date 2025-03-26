const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getFarmerRatingStats
} = require('../controllers/review.controller');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getReviews);

// Stats route must come before /:id route
router.get('/stats/:farmerId', getFarmerRatingStats);

// Single review route
router.get('/:id', getReview);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.route('/:id')
  .put(updateReview)
  .delete(deleteReview);

module.exports = router; 