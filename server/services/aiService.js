const axios = require('axios');
const config = require('../config/config');

/**
 * Built-in Rule-based anomaly engine fallback
 */
function localRuleBasedAnalysis(payload) {
  const {
    apiRequestsPerMinute = 10,
    failedLoginCount = 0,
    geoCountry = 'US',
    isOffHours = false,
    privilegeEscalationAttempt = false,
    publicBucketExposed = false,
    dataTransferVolumeGB = 0.5,
    resourceType = 'EC2 Server'
  } = payload;

  let anomalyDetected = false;
  let riskScore = 15;
  let severity = 'Low';
  let reasons = [];
  let recommendedActions = [];

  // Rule 1: Extreme API volume (e.g., normal 10 req/min vs 900 req/min)
  if (apiRequestsPerMinute >= 500) {
    anomalyDetected = true;
    riskScore += 45;
    reasons.push(`Unusual spike in API request volume (${apiRequestsPerMinute} req/min vs baseline 10-25 req/min). Potential automated reconnaissance or DDoS.`);
    recommendedActions.push('Enable aggressive WAF rate limiting and temporarily throttle suspect API client.');
  } else if (apiRequestsPerMinute >= 100) {
    anomalyDetected = true;
    riskScore += 25;
    reasons.push(`Elevated API traffic (${apiRequestsPerMinute} req/min). Exceeds typical operational thresholds.`);
    recommendedActions.push('Inspect API Gateway access logs for burst patterns.');
  }

  // Rule 2: Brute force authentication
  if (failedLoginCount >= 5) {
    anomalyDetected = true;
    riskScore += 35;
    reasons.push(`Multiple consecutive authentication failures (${failedLoginCount} attempts detected). High probability of credential stuffing or brute-force attack.`);
    recommendedActions.push('Enforce temporary IP lock, invalidate active refresh tokens, and mandate MFA challenge.');
  }

  // Rule 3: Public storage exposure
  if (publicBucketExposed) {
    anomalyDetected = true;
    riskScore += 40;
    reasons.push(`Cloud storage container configured with unrestricted public READ/WRITE permissions.`);
    recommendedActions.push('Immediately apply S3 Block Public Access settings and audit bucket policy.');
  }

  // Rule 4: Privilege escalation
  if (privilegeEscalationAttempt) {
    anomalyDetected = true;
    riskScore += 45;
    reasons.push(`Unauthorized IAM role policy modification detected granting AdministratorAccess permissions.`);
    recommendedActions.push('Revoke modified IAM inline policy and isolate compromised IAM credentials.');
  }

  // Rule 5: Mass data transfer / exfiltration
  if (dataTransferVolumeGB >= 50) {
    anomalyDetected = true;
    riskScore += 35;
    reasons.push(`Abnormal egress data transfer volume (${dataTransferVolumeGB} GB within 1 hour). High risk of data exfiltration.`);
    recommendedActions.push('Apply egress network security group rules and inspect VPC flow logs.');
  }

  // Rule 6: Off-hours or unexpected geography
  if (isOffHours && (apiRequestsPerMinute > 50 || failedLoginCount > 2)) {
    riskScore += 15;
    reasons.push('Elevated access pattern initiated during designated off-hours maintenance window.');
  }

  // Bound score
  riskScore = Math.min(100, Math.max(10, riskScore));

  if (riskScore >= 81) {
    severity = 'Critical';
    if (!anomalyDetected) anomalyDetected = true;
  } else if (riskScore >= 61) {
    severity = 'High';
    if (!anomalyDetected) anomalyDetected = true;
  } else if (riskScore >= 31) {
    severity = 'Medium';
  } else {
    severity = 'Low';
  }

  if (reasons.length === 0) {
    reasons.push('Telemetry falls within standard baseline parameters. Normal operating variance observed.');
    recommendedActions.push('Continue standard continuous security posture monitoring.');
  }

  return {
    anomalyDetected,
    riskScore,
    severity,
    explanation: reasons.join(' '),
    recommendedAction: recommendedActions.join(' '),
    engine: 'Rule-Based Anomaly Layer (Local Fallback)',
    analyzedAt: new Date().toISOString(),
    metrics: {
      apiRequestsPerMinute,
      failedLoginCount,
      dataTransferVolumeGB,
      resourceType
    }
  };
}

/**
 * Call the FastAPI Anomaly Detection service or fallback gracefully
 */
async function analyzeAnomaly(payload) {
  try {
    const response = await axios.post(
      `${config.aiServiceUrl}/analyze`,
      payload,
      { timeout: 3500 }
    );
    if (response.data) {
      return {
        ...response.data,
        engine: 'FastAPI Python ML/Anomaly Service (Live)'
      };
    }
  } catch (error) {
    // If FastAPI service is unreachable or starting, use internal high-fidelity engine
    console.log(`[AIService] FastAPI service at ${config.aiServiceUrl} unavailable (${error.message}). Using local rule-based anomaly detector.`);
  }

  return localRuleBasedAnalysis(payload);
}

module.exports = {
  analyzeAnomaly,
  localRuleBasedAnalysis
};
