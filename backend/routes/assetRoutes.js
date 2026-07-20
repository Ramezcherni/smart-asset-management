const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent d'être connecté
router.use(protect);

router.route('/')
  .get(getAssets)
  .post(authorize('Admin', 'Technician'), createAsset);

router.route('/:id')
  .get(getAssetById)
  .put(authorize('Admin', 'Technician'), updateAsset)
  .delete(authorize('Admin'), deleteAsset);

module.exports = router;