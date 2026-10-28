const mongoose = require('mongoose');

const cloudResourceSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: [
        'EC2 Server',
        'S3 Bucket',
        'RDS Database',
        'API Gateway',
        'Virtual Network',
        'Lambda Function',
        'IAM Role',
        'CloudTrail'
      ]
    },
    provider: {
      type: String,
      enum: ['AWS', 'GCP', 'Azure'],
      default: 'AWS'
    },
    region: {
      type: String,
      required: true,
      default: 'us-east-1'
    },
    status: {
      type: String,
      enum: ['Active', 'Warning', 'Critical', 'Stopped'],
      default: 'Active'
    },
    securityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low'
    },
    lastChecked: {
      type: Date,
      default: Date.now
    },
    tags: {
      environment: { type: String, default: 'Production' },
      owner: { type: String, default: 'DevSecOps Team' },
      criticality: { type: String, default: 'High' }
    },
    configurationDetails: {
      publicAccess: { type: Boolean, default: false },
      encryptionEnabled: { type: Boolean, default: true },
      mfaEnabled: { type: Boolean, default: true },
      backupEnabled: { type: Boolean, default: true },
      firewallRulesCount: { type: Number, default: 4 },
      openPorts: [{ type: Number }]
    },
    vulnerabilities: [
      {
        cve: { type: String },
        title: { type: String },
        severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
        detectedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['Open', 'Remediated'], default: 'Open' }
      }
    ],
    complianceStatus: {
      cis: { type: Boolean, default: true },
      soc2: { type: Boolean, default: true },
      pciDss: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CloudResource', cloudResourceSchema);
