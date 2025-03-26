const express = require('express');
const router = express.Router();
const { 
  getCrops, 
  getMarketplaceCrops,
  getCrop, 
  createCrop, 
  updateCrop, 
  deleteCrop, 
  getFarmerCrops, 
  cropPhotoUpload 
} = require('../controllers/crop.controller');

const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/fileUpload');

// Public routes
router.get('/', getCrops);
router.get('/marketplace', getMarketplaceCrops);
router.get('/:id', getCrop);

// Farmer only routes
router.use(protect);
router.route('/farmer/:farmerId').get(getFarmerCrops);
router.route('/').post(authorize('farmer'), createCrop);
router.route('/:id')
  .put(authorize('farmer', 'admin'), updateCrop)
  .delete(authorize('farmer', 'admin'), deleteCrop);

// Photo upload route
router.route('/:id/photo')
  .put(
    authorize('farmer', 'admin'), 
    uploadSingle('photo'), 
    cropPhotoUpload
  );

module.exports = router; 