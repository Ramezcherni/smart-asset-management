const Assignment = require('../models/Assignment');
const Asset = require('../models/Asset');

// @desc    Assigner un asset à un employé
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { asset, employee, notes } = req.body;

    // Vérifie que l'asset existe et est disponible
    const assetDoc = await Asset.findById(asset);
    if (!assetDoc) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    if (assetDoc.status === 'Assigned') {
      return res.status(400).json({ message: 'Asset is already assigned to someone' });
    }

    // Crée l'assignation
    const assignment = await Assignment.create({
      asset,
      employee,
      notes,
    });

    // Met à jour l'asset : statut + employé actuel
    assetDoc.status = 'Assigned';
    assetDoc.assignedTo = employee;
    await assetDoc.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('asset')
      .populate('employee');

    res.status(201).json(populatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer une assignation comme retournée
// @route   PUT /api/assignments/:id/return
const returnAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.status === 'Returned') {
      return res.status(400).json({ message: 'This assignment is already marked as returned' });
    }

    // Marque l'assignation comme rendue
    assignment.status = 'Returned';
    assignment.returnDate = Date.now();
    await assignment.save();

    // Libère l'asset
    const assetDoc = await Asset.findById(assignment.asset);
    if (assetDoc) {
      assetDoc.status = 'Available';
      assetDoc.assignedTo = null;
      await assetDoc.save();
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer toutes les assignations
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('asset')
      .populate('employee')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer l'historique des assignations d'un asset précis
// @route   GET /api/assignments/asset/:assetId
const getAssignmentsByAsset = async (req, res) => {
  try {
    const assignments = await Assignment.find({ asset: req.params.assetId })
      .populate('employee')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Récupérer l'historique des assignations d'un employé précis
// @route   GET /api/assignments/employee/:employeeId
const getAssignmentsByEmployee = async (req, res) => {
  try {
    const assignments = await Assignment.find({ employee: req.params.employeeId })
      .populate('asset')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  returnAssignment,
  getAssignments,
  getAssignmentsByAsset,
  getAssignmentsByEmployee,
};