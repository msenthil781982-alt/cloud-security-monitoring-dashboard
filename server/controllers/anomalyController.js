const { analyzeAnomaly } = require('../services/aiService');
const { logAction } = require('../services/auditService');

/**
 * @desc    Analyze simulated cloud telemetry for security anomalies
 * @route   POST /api/anomaly/analyze
 * @access  Private
 */
exports.analyze = async (req, res, next) => {
  try {
    const payload = req.body;

    const result = await analyzeAnomaly(payload);

    // Audit log this anomaly test/analysis
    if (req.user) {
      await logAction({
        user: req.user,
        action: 'Anomaly Analyzed',
        resourceAffected: payload.resourceName || payload.resourceType || 'Cloud Infrastructure',
        description: `AI Anomaly evaluation: ${result.anomalyDetected ? 'ANOMALY DETECTED' : 'NORMAL'} (Risk: ${result.riskScore}/100, Severity: ${result.severity})`,
        ipAddress: req.ip,
        metadata: {
          riskScore: result.riskScore,
          severity: result.severity,
          engine: result.engine
        }
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      disclaimer: 'Note: CloudGuard AI is currently analyzing simulated telemetry. Live AWS/GCP cloud connectors are simulated in demo mode.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get predefined simulation attack scenarios for instant viva testing
 * @route   GET /api/anomaly/scenarios
 * @access  Private
 */
exports.getScenarios = async (req, res, next) => {
  try {
    const scenarios = [
      {
        id: 'ddos-burst',
        name: 'API Flooding / Reconnaissance Burst',
        description: 'Simulates 920 requests/minute targeting CloudGuard API Gateway endpoint.',
        payload: {
          resourceName: 'prod-api-gateway-01',
          resourceType: 'API Gateway',
          apiRequestsPerMinute: 920,
          failedLoginCount: 0,
          geoCountry: 'RO',
          isOffHours: false,
          privilegeEscalationAttempt: false,
          publicBucketExposed: false,
          dataTransferVolumeGB: 2.1
        }
      },
      {
        id: 'brute-force',
        name: 'Distributed Credential Stuffing',
        description: 'Simulates 42 consecutive authentication failures on Bastion Host.',
        payload: {
          resourceName: 'bastion-host-01',
          resourceType: 'EC2 Server',
          apiRequestsPerMinute: 35,
          failedLoginCount: 42,
          geoCountry: 'CN',
          isOffHours: true,
          privilegeEscalationAttempt: false,
          publicBucketExposed: false,
          dataTransferVolumeGB: 0.1
        }
      },
      {
        id: 's3-leak',
        name: 'Public Bucket Policy Exposure',
        description: 'Simulates accidental ACL modification opening S3 customer-records bucket to public.',
        payload: {
          resourceName: 'secure-customer-records-s3',
          resourceType: 'S3 Bucket',
          apiRequestsPerMinute: 15,
          failedLoginCount: 0,
          geoCountry: 'US',
          isOffHours: false,
          privilegeEscalationAttempt: false,
          publicBucketExposed: true,
          dataTransferVolumeGB: 18.5
        }
      },
      {
        id: 'privilege-escalation',
        name: 'IAM Rogue Administrator Attachment',
        description: 'Simulates unauthorized IAM policy update assigning AdministratorAccess to service role.',
        payload: {
          resourceName: 'devops-deployer-role',
          resourceType: 'IAM Role',
          apiRequestsPerMinute: 12,
          failedLoginCount: 2,
          geoCountry: 'RU',
          isOffHours: true,
          privilegeEscalationAttempt: true,
          publicBucketExposed: false,
          dataTransferVolumeGB: 0.2
        }
      },
      {
        id: 'normal-baseline',
        name: 'Normal Standard Cloud Traffic',
        description: 'Simulates typical daytime production traffic well within safe operational baselines.',
        payload: {
          resourceName: 'customer-auth-service',
          resourceType: 'EC2 Server',
          apiRequestsPerMinute: 18,
          failedLoginCount: 0,
          geoCountry: 'US',
          isOffHours: false,
          privilegeEscalationAttempt: false,
          publicBucketExposed: false,
          dataTransferVolumeGB: 0.8
        }
      }
    ];

    res.status(200).json({
      success: true,
      data: scenarios
    });
  } catch (error) {
    next(error);
  }
};
