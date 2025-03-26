const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent user from submitting more than one review per crop per order
ReviewSchema.index({ user: 1, crop: 1, orderId: 1 }, { unique: true });

// Static method to get average rating and update product
ReviewSchema.statics.getAverageRating = async function(cropId) {
  const obj = await this.aggregate([
    {
      $match: { crop: cropId }
    },
    {
      $group: {
        _id: '$crop',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  // Update the crop with the average rating
  try {
    if (obj[0]) {
      await this.model('Crop').findByIdAndUpdate(cropId, {
        averageRating: obj[0].averageRating
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.crop);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.crop);
});

module.exports = mongoose.model('Review', ReviewSchema); 