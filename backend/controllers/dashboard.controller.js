const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// @desc    Get farmer dashboard stats
// @route   GET /api/dashboard/farmer
// @access  Private (farmers only)
exports.getFarmerDashboardStats = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this route'
      });
    }

    const farmerId = req.user.id;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Set start date to beginning of the year
    const yearStart = new Date(currentYear, 0, 1);
    
    // Calculate last month's date range
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);

    // Get orders for current month with this farmer's crops
    const currentMonthOrders = await Order.find({
      'orderItems.farmer': farmerId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lte: currentDate
      },
      status: { $ne: 'Cancelled' }
    }).populate('orderItems.crop');

    // Get orders for last month with this farmer's crops
    const lastMonthOrders = await Order.find({
      'orderItems.farmer': farmerId,
      createdAt: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      },
      status: { $ne: 'Cancelled' }
    }).populate('orderItems.crop');

    // Get all orders for this year with this farmer's crops
    const yearOrders = await Order.find({
      'orderItems.farmer': farmerId,
      createdAt: {
        $gte: yearStart,
        $lte: currentDate
      },
      status: { $ne: 'Cancelled' }
    }).populate({
      path: 'orderItems.crop',
      select: 'name category price'
    }).populate({
      path: 'buyer',
      select: 'name role'
    });

    // Get pending orders
    const pendingOrders = await Order.find({
      'orderItems.farmer': farmerId,
      status: 'Pending'
    }).countDocuments();

    // Get processing orders
    const processingOrders = await Order.find({
      'orderItems.farmer': farmerId,
      status: 'Processing'
    }).countDocuments();

    // Get total ratings and calculate average
    const reviews = await Review.find({ farmer: farmerId });
    const totalReviews = reviews.length;
    let averageRating = 0;
    
    if (totalReviews > 0) {
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (ratingSum / totalReviews).toFixed(1);
    }

    // Initialize data for monthly statistics
    const monthlyData = Array(12).fill().map(() => ({
      revenue: 0,
      quantitySold: 0
    }));

    // Calculate total sales, revenue, and monthly breakdown
    let totalRevenue = 0;
    let totalQuantitySold = 0;
    let cropSalesMap = {};
    let customerTypeRevenue = {
      restaurant: 0,
      individual: 0,
      wholesaler: 0
    };

    // Process year orders
    yearOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          const orderMonth = new Date(order.createdAt).getMonth();
          const itemRevenue = item.price * item.quantity;
          const cropName = item.crop ? item.crop.name : 'Unknown Crop';
          
          // Update monthly data
          monthlyData[orderMonth].revenue += itemRevenue;
          monthlyData[orderMonth].quantitySold += item.quantity;
          
          // Update total stats
          totalRevenue += itemRevenue;
          totalQuantitySold += item.quantity;
          
          // Update crop sales data
          if (!cropSalesMap[cropName]) {
            cropSalesMap[cropName] = {
              quantity: 0,
              revenue: 0
            };
          }
          cropSalesMap[cropName].quantity += item.quantity;
          cropSalesMap[cropName].revenue += itemRevenue;
          
          // Update customer type revenue
          if (order.buyer) {
            if (order.buyer.role === 'restaurant') {
              customerTypeRevenue.restaurant += itemRevenue;
            } else if (order.buyer.role === 'individual') {
              customerTypeRevenue.individual += itemRevenue;
            } else {
              customerTypeRevenue.wholesaler += itemRevenue;
            }
          }
        }
      });
    });

    // Calculate growth percentages
    let currentMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let currentMonthQuantity = 0;
    let lastMonthQuantity = 0;

    // Calculate current month stats
    currentMonthOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          currentMonthRevenue += item.price * item.quantity;
          currentMonthQuantity += item.quantity;
        }
      });
    });

    // Calculate last month stats
    lastMonthOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          lastMonthRevenue += item.price * item.quantity;
          lastMonthQuantity += item.quantity;
        }
      });
    });

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue > 0 
      ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : 100;
    
    const quantityGrowth = lastMonthQuantity > 0
      ? (((currentMonthQuantity - lastMonthQuantity) / lastMonthQuantity) * 100).toFixed(1)
      : 100;

    // Convert crop sales map to an array and sort by revenue
    const topSellingCrops = Object.entries(cropSalesMap).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
      // For simplicity, let's set random growth between -5% and +20%
      growth: (Math.random() * 25 - 5).toFixed(1)
    })).sort((a, b) => b.revenue - a.revenue);

    // Get recent orders (only completed/delivered ones)
    const recentSoldCrops = await Order.find({
      'orderItems.farmer': farmerId,
      status: 'Delivered'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: 'orderItems.crop',
      select: 'name price'
    });

    // Format recent sold crops data
    const recentSoldCropsData = [];
    recentSoldCrops.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          recentSoldCropsData.push({
            orderId: `#ORD-${order._id.toString().substr(-6)}`,
            crop: item.crop ? item.crop.name : 'Unknown Crop',
            quantity: `${item.quantity} kg`,
            pricePerUnit: `₹${item.price}/kg`,
            total: `₹${(item.price * item.quantity).toLocaleString()}`,
            date: new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            status: order.status
          });
        }
      });
    });

    // Prepare monthly data for charts
    const monthlyRevenueData = monthlyData.map(data => data.revenue);
    const monthlyQuantityData = monthlyData.map(data => data.quantitySold);

    // Prepare response data
    const dashboardData = {
      summary: {
        totalRevenue: {
          value: Math.round(totalRevenue),
          growth: revenueGrowth
        },
        totalSales: {
          value: totalQuantitySold,
          growth: quantityGrowth
        },
        pendingOrders: {
          value: pendingOrders,
          processing: processingOrders
        },
        rating: {
          value: averageRating,
          totalReviews
        }
      },
      charts: {
        monthlyRevenue: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          revenue: monthlyRevenueData,
          quantity: monthlyQuantityData
        },
        cropDistribution: topSellingCrops.slice(0, 5).map(crop => ({
          name: crop.name,
          quantity: crop.quantity
        })),
        customerRevenue: [
          {
            type: 'Restaurants',
            value: Math.round(customerTypeRevenue.restaurant)
          },
          {
            type: 'Individual Buyers',
            value: Math.round(customerTypeRevenue.individual)
          },
          {
            type: 'Wholesalers',
            value: Math.round(customerTypeRevenue.wholesaler)
          }
        ]
      },
      recentSoldCrops: recentSoldCropsData,
      topSellingCrops: topSellingCrops.slice(0, 5)
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get monthly sales data for farmer
// @route   GET /api/dashboard/farmer/monthly-sales
// @access  Private (farmers only)
exports.getFarmerMonthlySales = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this route'
      });
    }

    const farmerId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Aggregate monthly sales data
    const monthlySales = await Order.aggregate([
      {
        $match: {
          'orderItems.farmer': mongoose.Types.ObjectId(farmerId),
          status: { $ne: 'Cancelled' },
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59)
          }
        }
      },
      { $unwind: '$orderItems' },
      {
        $match: {
          'orderItems.farmer': mongoose.Types.ObjectId(farmerId)
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          quantity: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Initialize data for all months
    const monthlyData = Array(12).fill().map((_, index) => ({
      month: index + 1,
      revenue: 0,
      quantity: 0
    }));

    // Fill in the actual data
    monthlySales.forEach(item => {
      monthlyData[item._id - 1] = {
        month: item._id,
        revenue: item.revenue,
        quantity: item.quantity
      };
    });

    res.status(200).json({
      success: true,
      data: monthlyData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales by crop type for farmer
// @route   GET /api/dashboard/farmer/sales-by-crop
// @access  Private (farmers only)
exports.getFarmerSalesByCrop = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this route'
      });
    }

    const farmerId = req.user.id;
    const period = req.query.period || 'year'; // year, month, week
    
    let startDate;
    const endDate = new Date();
    
    if (period === 'week') {
      // Last 7 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      // Last 30 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // This year
      startDate = new Date(endDate.getFullYear(), 0, 1);
    }
    
    // Get orders with populated crop data
    const orders = await Order.find({
      'orderItems.farmer': farmerId,
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate({
      path: 'orderItems.crop',
      select: 'name category'
    });

    // Calculate sales by crop
    const cropSalesMap = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId && item.crop) {
          const cropName = item.crop.name;
          
          if (!cropSalesMap[cropName]) {
            cropSalesMap[cropName] = {
              quantity: 0,
              revenue: 0
            };
          }
          
          cropSalesMap[cropName].quantity += item.quantity;
          cropSalesMap[cropName].revenue += item.price * item.quantity;
        }
      });
    });
    
    // Convert to array and sort by quantity
    const cropSalesData = Object.entries(cropSalesMap).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue
    })).sort((a, b) => b.quantity - a.quantity);

    res.status(200).json({
      success: true,
      period,
      data: cropSalesData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get revenue by customer type for farmer
// @route   GET /api/dashboard/farmer/revenue-by-customer
// @access  Private (farmers only)
exports.getFarmerRevenueByCustomer = async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.user.role !== 'farmer') {
      return res.status(403).json({
        success: false,
        message: 'Only farmers can access this route'
      });
    }

    const farmerId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    // Define date range
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Get orders with populated buyer data
    const orders = await Order.find({
      'orderItems.farmer': farmerId,
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate({
      path: 'buyer',
      select: 'role'
    });

    // Initialize revenue by customer type
    const revenueByCustomer = {
      restaurant: 0,
      individual: 0,
      wholesaler: 0 // For any other role or undefined roles
    };
    
    // Calculate revenue by customer type
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.farmer.toString() === farmerId) {
          const itemRevenue = item.price * item.quantity;
          
          if (order.buyer && order.buyer.role === 'restaurant') {
            revenueByCustomer.restaurant += itemRevenue;
          } else if (order.buyer && order.buyer.role === 'individual') {
            revenueByCustomer.individual += itemRevenue;
          } else {
            revenueByCustomer.wholesaler += itemRevenue;
          }
        }
      });
    });
    
    // Calculate percentages
    const totalRevenue = revenueByCustomer.restaurant + 
                          revenueByCustomer.individual + 
                          revenueByCustomer.wholesaler;
    
    const customerRevenue = [
      {
        type: 'Restaurants',
        value: revenueByCustomer.restaurant,
        percentage: totalRevenue > 0 
          ? Math.round((revenueByCustomer.restaurant / totalRevenue) * 100) 
          : 0
      },
      {
        type: 'Individual Buyers',
        value: revenueByCustomer.individual,
        percentage: totalRevenue > 0 
          ? Math.round((revenueByCustomer.individual / totalRevenue) * 100) 
          : 0
      },
      {
        type: 'Wholesalers',
        value: revenueByCustomer.wholesaler,
        percentage: totalRevenue > 0 
          ? Math.round((revenueByCustomer.wholesaler / totalRevenue) * 100) 
          : 0
      }
    ];

    res.status(200).json({
      success: true,
      data: customerRevenue,
      totalRevenue
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 