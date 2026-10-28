/**
 * Client-Side Risk Engine replica for viva demonstration & interactive testing
 */

export const RISK_LEVELS = {
  LOW: { min: 0, max: 30, label: 'Low', color: '#10b981' },
  MEDIUM: { min: 31, max: 60, label: 'Medium', color: '#f59e0b' },
  HIGH: { min: 61, max: 80, label: 'High', color: '#f97316' },
  CRITICAL: { min: 81, max: 100, label: 'Critical', color: '#ef4444' }
};

export const SEVERITY_WEIGHTS = {
  Low: 15,
  Medium: 45,
  High: 75,
  Critical: 95
};

export const RESOURCE_WEIGHTS = {
  'RDS Database': 90,
  'S3 Bucket': 85,
  'IAM Role': 95,
  'EC2 Server': 70,
  'API Gateway': 65,
  'Virtual Network': 60,
  'Lambda Function': 55,
  'CloudTrail': 80
};

export function computeClientRisk({
  severity = 'Medium',
  resourceType = 'EC2 Server',
  frequency = 1,
  isAuthFailure = false,
  isUnusualActivity = false
}) {
  const baseWeight = SEVERITY_WEIGHTS[severity] || 50;
  const severityScore = baseWeight * 0.40;

  let freqFactor = 10;
  if (frequency > 500) freqFactor = 100;
  else if (frequency > 100) freqFactor = 85;
  else if (frequency > 20) freqFactor = 65;
  else if (frequency > 5) freqFactor = 40;
  const frequencyScore = freqFactor * 0.20;

  const resSensitivity = RESOURCE_WEIGHTS[resourceType] || 60;
  const resourceScore = resSensitivity * 0.20;

  let indicator = 20;
  if (isAuthFailure) indicator += 35;
  if (isUnusualActivity) indicator += 45;
  indicator = Math.min(indicator, 100);
  const indicatorScore = indicator * 0.20;

  const rawScore = Math.round(severityScore + frequencyScore + resourceScore + indicatorScore);
  const score = Math.max(5, Math.min(100, rawScore));

  let level = 'Low';
  if (score >= 81) level = 'Critical';
  else if (score >= 61) level = 'High';
  else if (score >= 31) level = 'Medium';

  return {
    score,
    level,
    breakdown: {
      severityScore: Math.round(severityScore),
      frequencyScore: Math.round(frequencyScore),
      resourceScore: Math.round(resourceScore),
      indicatorScore: Math.round(indicatorScore)
    }
  };
}
