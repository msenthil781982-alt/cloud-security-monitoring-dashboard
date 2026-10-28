/**
 * CloudGuard AI - Transparent Risk Scoring Engine
 * 
 * Risk Formula:
 * Total Risk (0-100) = Base Severity Weight (40%) 
 *                    + Frequency & Volume Factor (20%) 
 *                    + Resource Sensitivity Weight (20%) 
 *                    + Authentication / Anomaly Indicators (20%)
 * 
 * Tiered classification:
 * - 0 - 30:   LOW
 * - 31 - 60:  MEDIUM
 * - 61 - 80:  HIGH
 * - 81 - 100: CRITICAL
 */

const SEVERITY_BASE_WEIGHTS = {
  Low: 15,
  Medium: 45,
  High: 75,
  Critical: 95
};

const RESOURCE_SENSITIVITY = {
  'RDS Database': 90,     // Holds sensitive stateful data
  'S3 Bucket': 85,        // Often targeted for public exposure
  'IAM Role': 95,         // Identity & privilege escalation vector
  'EC2 Server': 70,       // Compute workloads
  'API Gateway': 65,      // External perimeter
  'Virtual Network': 60,  // Network isolation
  'Lambda Function': 55,  // Serverless execution
  'CloudTrail': 80        // Auditing & logging pipeline
};

/**
 * Calculate dynamic risk score for an event or resource
 * @param {Object} params
 * @param {string} params.severity - 'Low' | 'Medium' | 'High' | 'Critical'
 * @param {string} params.resourceType - Type of resource
 * @param {number} [params.frequency=1] - Frequency of events within time window
 * @param {boolean} [params.isAuthFailure=false] - Whether authentication failed
 * @param {boolean} [params.isUnusualActivity=false] - AI anomaly flag
 * @returns {Object} { score: number, level: string, breakdown: Object }
 */
function calculateRiskScore({
  severity = 'Medium',
  resourceType = 'EC2 Server',
  frequency = 1,
  isAuthFailure = false,
  isUnusualActivity = false
}) {
  // 1. Severity component (40% weight)
  const baseWeight = SEVERITY_BASE_WEIGHTS[severity] || 50;
  const severityScore = baseWeight * 0.40;

  // 2. Frequency factor (20% weight) - Logarithmic scale up to 100
  // e.g. 1 req = 10, 10 req = 40, 50 req = 75, 100+ req = 100
  let freqFactor = 10;
  if (frequency > 500) freqFactor = 100;
  else if (frequency > 100) freqFactor = 85;
  else if (frequency > 20) freqFactor = 65;
  else if (frequency > 5) freqFactor = 40;
  const frequencyScore = freqFactor * 0.20;

  // 3. Resource sensitivity component (20% weight)
  const resSensitivity = RESOURCE_SENSITIVITY[resourceType] || 60;
  const resourceScore = resSensitivity * 0.20;

  // 4. Behavioral & Anomaly Indicator (20% weight)
  let indicator = 20; // default baseline
  if (isAuthFailure) indicator += 35;
  if (isUnusualActivity) indicator += 45;
  indicator = Math.min(indicator, 100);
  const indicatorScore = indicator * 0.20;

  // Calculate final score bounded 0 - 100
  const rawScore = Math.round(severityScore + frequencyScore + resourceScore + indicatorScore);
  const finalScore = Math.max(5, Math.min(100, rawScore));

  // Determine risk level category
  let level = 'Low';
  if (finalScore >= 81) level = 'Critical';
  else if (finalScore >= 61) level = 'High';
  else if (finalScore >= 31) level = 'Medium';

  return {
    score: finalScore,
    level,
    breakdown: {
      severityContribution: Math.round(severityScore),
      frequencyContribution: Math.round(frequencyScore),
      resourceContribution: Math.round(resourceScore),
      indicatorContribution: Math.round(indicatorScore)
    }
  };
}

module.exports = {
  calculateRiskScore,
  SEVERITY_BASE_WEIGHTS,
  RESOURCE_SENSITIVITY
};
