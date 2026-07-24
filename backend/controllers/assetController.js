const Asset = require('../models/Asset');
const { logAction } = require('../utils/auditLogger');

// @desc    Créer un nouvel asset
// @route   POST /api/assets
const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    await logAction(req.user._id, 'CREATE', 'Asset', asset._id, `Created asset "${asset.name}"`);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer tous les assets
// @route   GET /api/assets
const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().populate('assignedTo');
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer un asset par son ID
// @route   GET /api/assets/:id
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('assignedTo');
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Modifier un asset
// @route   PUT /api/assets/:id
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    await logAction(req.user._id, 'UPDATE', 'Asset', asset._id, `Updated asset "${asset.name}"`);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Supprimer un asset
// @route   DELETE /api/assets/:id
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    await logAction(req.user._id, 'DELETE', 'Asset', asset._id, `Deleted asset "${asset.name}"`);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
};