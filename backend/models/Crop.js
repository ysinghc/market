const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a crop name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['grains', 'vegetables', 'fruits', 'pulses', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity available'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price per kg'],
    min: [1, 'Price must be at least 1']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  harvestDate: {
    type: Date,
    required: [true, 'Please provide a harvest date']
  },
  image: {
    type: String,
    default: 'default-crop.jpg'
  },
  minOrder: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order must be at least 1']
  },
  availableUntil: {
    type: Date,
    required: [true, 'Please provide an availability end date']
  },
  publishedToMarketplace: {
    type: Boolean,
    default: false
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a compound index on farmer and name for quicker lookups
CropSchema.index({ farmer: 1, name: 1 });

module.exports = mongoose.model('Crop', CropSchema); 