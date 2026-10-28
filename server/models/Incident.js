const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
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
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'Contained', 'Resolved'],
      default: 'Open'
    },
    priority: {
      type: String,
      enum: ['P1', 'P2', 'P3', 'P4'],
      default: 'P2'
    },
    assignedAnalyst: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAnalystName: {
      type: String,
      default: 'Security Ops Team'
    },
    affectedResources: [
      {
        type: String
      }
    ],
    linkedAlerts: [
      {
        type: String
      }
    ],
    timeline: [
      {
        action: { type: String, required: true },
        performedBy: { type: String, default: 'System' },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
      }
    ],
    rootCause: {
      type: String,
      default: 'Under investigation by SOC tier 2 analyst'
    },
    mitigationSteps: {
      type: String,
      default: 'Rotate exposed credentials, enforce MFA policy, update WAF rules'
    }
  },
  {
    timestamps: true
  }
);

incidentSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
