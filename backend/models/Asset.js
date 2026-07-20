const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Laptop', 'Desktop', 'Monitor', 'Printer', 'Phone', 'Other'],
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'Under Maintenance', 'Retired'],
      default: 'Available',
    },
    purchaseDate: {
      type: Date,
    },
    warrantyExpiryDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);