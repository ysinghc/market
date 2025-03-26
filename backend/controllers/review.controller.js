const Review = require('../models/Review');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    let query = {};
    
    // Filter by farmer ID if provided
    if (req.query.farmer) {
      query.farmer = req.query.farmer;
    }
    
    // Filter by rating if provided
    if (req.query.rating) {
      query.rating = req.query.rating;
    }
    
    // Count total documents with the query
    const total = await Review.countDocuments(query);
    
    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate({
        path: 'reviewer',
        select: 'name avatar'
      })
      .populate({
        path: 'farmer',
        select: 'name'
      })
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'reviewer',
        select: 'name avatar'
      })
      .populate({
        path: 'farmer',
        select: 'name'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { farmer, rating, comment, orderId } = req.body;

    // Validate required fields
    if (!farmer || !rating || !comment || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmer, rating, comment, and orderId'
      });
    }

    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify farmer exists
    const farmerExists = await User.findById(farmer);
    if (!farmerExists || farmerExists.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Verify order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this order'
      });
    }

    // Check if order contains items from this farmer
    const hasFarmerItems = order.orderItems.some(
      item => item.farmer.toString() === farmer
    );

    if (!hasFarmerItems) {
      return res.status(400).json({
        success: false,
        message: 'You can only review farmers from whom you have purchased items'
      });
    }

    // Check if order is delivered
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed orders'
      });
    }

    // Check if user has already reviewed this farmer for this order
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      farmer: farmer,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this farmer for this order'
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      farmer: farmer,
      rating,
      comment,
      order: orderId
    });

    // Add review to order
    if (!order.reviewed) {
      order.reviewed = true;
      await order.save();
    }

    // Return the newly created review with populated fields
    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'reviewer',
        select: 'name avatar'
      })
      .populate({
        path: 'farmer',
        select: 'name'
      });

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Find review by ID
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this review'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update review fields
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    // Save updated review
    await review.save();

    // Return updated review with populated fields
    const updatedReview = await Review.findById(review._id)
      .populate({
        path: 'reviewer',
        select: 'name avatar'
      })
      .populate({
        path: 'farmer',
        select: 'name'
      });

    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer or admin
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get farmer's rating statistics
// @route   GET /api/reviews/stats/:farmerId
// @access  Public
exports.getFarmerRatingStats = async (req, res) => {
  try {
    const farmerId = req.params.farmerId;

    // Verify farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Get all reviews for the farmer
    const reviews = await Review.find({ farmer: farmerId });

    // If no reviews exist yet
    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          farmerId,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          }
        }
      });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    res.status(200).json({
      success: true,
      data: {
        farmerId,
        averageRating,
        totalReviews: reviews.length,
        ratingDistribution
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 