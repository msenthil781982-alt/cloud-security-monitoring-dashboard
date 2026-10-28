const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
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
    detectedTime: {
      type: Date,
      default: Date.now
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50
    },
    status: {
      type: String,
      enum: ['New', 'Investigating', 'Resolved', 'False Positive'],
      default: 'New'
    },
    source: {
      type: String,
      enum: ['AI Anomaly Detector', 'Rule Engine', 'CloudTrail Audit', 'IDS/IPS'],
      default: 'AI Anomaly Detector'
    },
    description: {
      type: String,
      required: true
    },
    recommendedAction: {
      type: String,
      default: 'Isolate affected instance and revoke suspect IAM credentials.'
    },
    assignedTo: {
      type: String,
      default: 'Unassigned'
    },
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ status: 1, severity: 1, detectedTime: -1 });

module.exports = mongoose.model('Alert', alertSchema);
