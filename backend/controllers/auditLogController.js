const AuditLog = require('../models/AuditLog');

// @desc    Récupérer tous les logs (Admin seulement)
// @route   GET /api/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200); // limite raisonnable

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAuditLogs };