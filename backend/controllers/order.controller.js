const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Calculate total price and validate crop availability
    let totalPrice = 0;
    
    // Process each order item
    for (const item of orderItems) {
      const crop = await Crop.findById(item.crop);
      
      if (!crop) {
        return res.status(404).json({
          success: false,
          message: `Crop not found with id ${item.crop}`
        });
      }
      
      // Check if published to marketplace
      if (!crop.publishedToMarketplace) {
        return res.status(400).json({
          success: false,
          message: `Crop ${crop.name} is not available in the marketplace`
        });
      }
      
      // Check if quantity is available
      if (crop.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough quantity available for ${crop.name}`
        });
      }
      
      // Check if minimum order quantity is met
      if (item.quantity < crop.minOrder) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${crop.name} is ${crop.minOrder}`
        });
      }
      
      // Set price to current crop price and farmer id
      item.price = crop.price;
      item.farmer = crop.farmer;
      
      // Calculate item total and add to order total
      totalPrice += item.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      buyer: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Pending'
    });

    // Add initial status update
    order.statusUpdates.push({
      status: 'Pending',
      comment: 'Order placed'
    });

    await order.save();

    // Update crop quantities
    for (const item of orderItems) {
      const crop = await Crop.findById(item.crop);
      crop.quantity -= item.quantity;
      await crop.save();
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'buyer',
        select: 'name email phoneNumber'
      })
      .populate({
        path: 'orderItems.crop',
        select: 'name image category'
      })
      .populate({
        path: 'orderItems.farmer',
        select: 'name email phoneNumber'
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view the order
    if (order.buyer._id.toString() !== req.user.id && 
        !order.orderItems.some(item => item.farmer._id.toString() === req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .sort('-createdAt')
      .populate({
        path: 'orderItems.crop',
        select: 'name image'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get farmer's received orders
// @route   GET /api/orders/farmer
// @access  Private (farmers only)
exports.getFarmerOrders = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this route'
      });
    }

    // Find orders where the user is a farmer for any of the order items
    const orders = await Order.find({
      'orderItems.farmer': req.user.id
    })
      .sort('-createdAt')
      .populate({
        path: 'buyer',
        select: 'name email phoneNumber'
      })
      .populate({
        path: 'orderItems.crop',
        select: 'name image category'
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (farmer or admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to update the order
    const isFarmerForAnyItem = order.orderItems.some(
      item => item.farmer.toString() === req.user.id
    );

    if (!isFarmerForAnyItem && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order'
      });
    }

    // Update order status
    order.status = status;
    
    // Add status update
    order.statusUpdates.push({
      status,
      comment: comment || `Order status updated to ${status}`
    });

    // Set delivered/paid status if applicable
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (req.body.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (buyer, farmer, or admin)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled as it is already being processed'
      });
    }

    // Check if user is authorized to cancel the order
    const isFarmerForAnyItem = order.orderItems.some(
      item => item.farmer.toString() === req.user.id
    );

    if (order.buyer.toString() !== req.user.id && !isFarmerForAnyItem && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this order'
      });
    }

    // Update order status
    order.status = 'Cancelled';
    
    // Add status update
    order.statusUpdates.push({
      status: 'Cancelled',
      comment: req.body.comment || 'Order cancelled by user'
    });

    await order.save();

    // Restore crop quantities
    for (const item of order.orderItems) {
      const crop = await Crop.findById(item.crop);
      if (crop) {
        crop.quantity += item.quantity;
        await crop.save();
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 