const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action, entityType, entityId, details) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = { logAction };