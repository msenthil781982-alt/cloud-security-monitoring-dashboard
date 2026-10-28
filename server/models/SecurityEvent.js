const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'Failed Login Attempt',
        'Unauthorized Access',
        'Suspicious API Request',
        'Privilege Change',
        'Unusual Network Activity',
        'Multiple Authentication Failures',
        'Data Exfiltration Attempt',
        'Policy Violation'
      ]
    },
    userOrIp: {
      type: String,
      required: true,
      trim: true
    },
    resource: {
      type: String,
      required: true,
      trim: true
    },
    resourceType: {
      type: String,
      default: 'EC2 Server'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    description: {
      type: String,
      required: true
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50
    },
    category: {
      type: String,
      enum: ['Authentication', 'Access Control', 'Network', 'API', 'Data Protection'],
      default: 'Authentication'
    },
    metadata: {
      userAgent: { type: String, default: 'Mozilla/5.0 (Security Agent)' },
      location: { type: String, default: 'Unknown' },
      requestCount: { type: Number, default: 1 },
      protocol: { type: String, default: 'HTTPS' }
    }
  },
  {
    timestamps: true
  }
);

// Index for high-performance dashboard filtering
securityEventSchema.index({ severity: 1, eventType: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
