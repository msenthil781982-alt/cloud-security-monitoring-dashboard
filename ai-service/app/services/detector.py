import datetime
from .rules import (
    BASELINE_API_RATE,
    HIGH_API_RATE_THRESHOLD,
    CRITICAL_API_RATE_THRESHOLD,
    FAILED_LOGIN_WARN_THRESHOLD,
    FAILED_LOGIN_CRITICAL_THRESHOLD,
    HIGH_RISK_COUNTRIES,
    SENSITIVE_RESOURCES
)

class AnomalyDetector:
    """
    CloudGuard AI Anomaly Detection Engine.
    Combines rule-based behavioral heuristics with statistical deviation scores.
    Extensible interface: Future ML models (IsolationForest, Autoencoders) can override detect_anomaly().
    """

    def __init__(self, model_version: str = "v1.2-rule-heuristic"):
        self.model_version = model_version

    def evaluate(self, telemetry: dict) -> dict:
        api_rate = telemetry.get("apiRequestsPerMinute", 10)
        failed_logins = telemetry.get("failedLoginCount", 0)
        geo = telemetry.get("geoCountry", "US")
        off_hours = telemetry.get("isOffHours", False)
        priv_esc = telemetry.get("privilegeEscalationAttempt", False)
        public_bucket = telemetry.get("publicBucketExposed", False)
        egress_gb = telemetry.get("dataTransferVolumeGB", 0.5)
        resource_type = telemetry.get("resourceType", "EC2 Server")

        anomaly_detected = False
        risk_score = 10
        reasons = []
        recommendations = []
        confidence = 0.85

        # 1. API Rate Anomaly Check (e.g. 10 req/min normal vs 900 req/min flood)
        if api_rate >= CRITICAL_API_RATE_THRESHOLD:
            anomaly_detected = True
            risk_score += 48
            reasons.append(
                f"Severe API flood anomaly detected: {api_rate} req/min (Normal baseline is {BASELINE_API_RATE} req/min). "
                f"Exceeds threshold by {round((api_rate / BASELINE_API_RATE) * 100)}%."
            )
            recommendations.append("Apply automated WAF rate limiting and temporarily quarantine suspect IP range.")
            confidence = 0.95
        elif api_rate >= HIGH_API_RATE_THRESHOLD:
            anomaly_detected = True
            risk_score += 28
            reasons.append(f"Elevated API traffic detected: {api_rate} req/min. Potential reconnaissance crawl.")
            recommendations.append("Inspect API Gateway endpoint logs for repetitive patterns.")

        # 2. Authentication Failure Heuristic
        if failed_logins >= FAILED_LOGIN_CRITICAL_THRESHOLD:
            anomaly_detected = True
            risk_score += 38
            reasons.append(
                f"Critical authentication failure count: {failed_logins} failed attempts detected. "
                f"Indicates automated credential stuffing or dictionary attack."
            )
            recommendations.append("Lock target accounts, enforce MFA challenge, and block source IP.")
            confidence = 0.92
        elif failed_logins >= FAILED_LOGIN_WARN_THRESHOLD:
            anomaly_detected = True
            risk_score += 20
            reasons.append(f"Repeated login failures: {failed_logins} attempts.")
            recommendations.append("Monitor account login activity closely.")

        # 3. Public Storage Policy Violation
        if public_bucket:
            anomaly_detected = True
            risk_score += 45
            reasons.append("S3 bucket public access policy actively exposed to the internet (Principal: *).")
            recommendations.append("Immediately enable S3 Block Public Access and audit data access logs.")
            confidence = 0.98

        # 4. Privilege Escalation
        if priv_esc:
            anomaly_detected = True
            risk_score += 46
            reasons.append("Unauthorized IAM policy modification granting AdministratorAccess detected.")
            recommendations.append("Revoke administrator privileges, invalidate role session tokens, and trigger security review.")
            confidence = 0.96

        # 5. Data Egress Exfiltration
        if egress_gb >= 30.0:
            anomaly_detected = True
            risk_score += 35
            reasons.append(f"Anomalous high data egress transfer: {egress_gb} GB observed outside regular backup cycle.")
            recommendations.append("Apply egress security group restriction and examine VPC flow logs.")

        # 6. Off-Hours & Geo Location Factor
        if off_hours and (api_rate > 50 or failed_logins > 1):
            risk_score += 15
            reasons.append("High sensitivity activity detected during scheduled off-hours window.")

        if geo in HIGH_RISK_COUNTRIES and (api_rate > 100 or failed_logins > 2):
            risk_score += 12
            reasons.append(f"Traffic originated from elevated threat region ({geo}).")

        # Bound risk score between 5 and 100
        risk_score = min(100, max(5, risk_score))

        # Severity classification
        if risk_score >= 81:
            severity = "CRITICAL"
            anomaly_detected = True
        elif risk_score >= 61:
            severity = "HIGH"
            anomaly_detected = True
        elif risk_score >= 31:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        if not reasons:
            reasons.append("Telemetry metrics remain within standard baseline parameters. Normal operations confirmed.")
            recommendations.append("No immediate action required. Maintain standard automated monitoring.")

        return {
            "anomalyDetected": anomaly_detected,
            "riskScore": risk_score,
            "severity": severity,
            "explanation": " ".join(reasons),
            "recommendedAction": " ".join(recommendations),
            "engine": f"CloudGuard Hybrid AI Rule Engine ({self.model_version})",
            "confidence": round(confidence, 2),
            "analyzedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "metrics": {
                "apiRequestsPerMinute": api_rate,
                "failedLoginCount": failed_logins,
                "dataTransferVolumeGB": egress_gb,
                "resourceType": resource_type,
                "geoCountry": geo
            }
        }
