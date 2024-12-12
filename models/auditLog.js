const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Reference to the User model
      required: true
    },
    action: {
      type: String,
      enum: ['update', 'delete','create'], // Possible actions
      required: true
    },
    field: {
      type: String,
      required: true
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed // Accepts any type of data
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed // Accepts any type of data
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
