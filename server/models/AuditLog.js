const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      default: 'System Agent'
    },
    userEmail: {
      type: String,
      default: 'system@cloudguard.io'
    },
    userRole: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true,
      enum: [
        'User Login',
        'User Logout',
        'User Registered',
        'Alert Status Changed',
        'Incident Created',
        'Incident Updated',
        'Resource Checked',
        'Anomaly Analyzed',
        'User Role Changed',
        'Security Policy Updated'
      ]
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    resourceAffected: {
      type: String,
      default: 'System'
    },
    description: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ timestamp: -1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
