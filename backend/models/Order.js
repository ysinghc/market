const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      crop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Crop',
        required: true
      },
      farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: true,
        min: [1, 'Price must be at least 1']
      }
    }
  ],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'UPI', 'NetBanking', 'CreditCard']
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  statusUpdates: [
    {
      status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      comment: String
    }
  ],
  deliveryDate: {
    type: Date
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound indexes for better query performance
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ 'orderItems.farmer': 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema); 