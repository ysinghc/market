const Crop = require('../models/Crop');
const User = require('../models/User');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
exports.getCrops = async (req, res) => {
  try {
    // Build query
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Crop.find(JSON.parse(queryStr)).populate({
      path: 'farmer',
      select: 'name email'
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Crop.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const crops = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: crops.length,
      pagination,
      data: crops
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get marketplace crops (published only)
// @route   GET /api/crops/marketplace
// @access  Public
exports.getMarketplaceCrops = async (req, res) => {
  try {
    // Get only published crops
    req.query.publishedToMarketplace = true;
    
    // Call the getCrops function
    return exports.getCrops(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
exports.getCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate({
      path: 'farmer',
      select: 'name email phoneNumber'
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private (farmers only)
exports.createCrop = async (req, res) => {
  try {
    // Add farmer to req.body
    req.body.farmer = req.user.id;

    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can add crops'
      });
    }

    // Create crop
    const crop = await Crop.create(req.body);

    res.status(201).json({
      success: true,
      data: crop
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private (farmer owner only)
exports.updateCrop = async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Make sure user is the crop owner
    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this crop'
      });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private (farmer owner only)
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Make sure user is the crop owner
    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this crop'
      });
    }

    await crop.remove();

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

// @desc    Get crops for a farmer
// @route   GET /api/crops/farmer/:farmerId
// @access  Public
exports.getFarmerCrops = async (req, res) => {
  try {
    const farmer = await User.findById(req.params.farmerId);

    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Add farmerId to query
    req.query.farmer = req.params.farmerId;
    
    // Call the getCrops function
    return exports.getCrops(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload crop image
// @route   PUT /api/crops/:id/photo
// @access  Private (farmer owner only)
exports.cropPhotoUpload = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Make sure user is the crop owner
    if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this crop'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Update crop with new image
    crop.image = `/uploads/${req.file.filename}`;
    await crop.save();

    res.status(200).json({
      success: true,
      data: crop
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 