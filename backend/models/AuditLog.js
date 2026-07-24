const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true, // ex: "CREATE", "UPDATE", "DELETE"
    },
    entityType: {
      type: String,
      required: true, // ex: "Asset", "Employee", "Ticket", "User"
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String, // description lisible de l'action
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);