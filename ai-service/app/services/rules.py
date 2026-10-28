"""
Rule-based heuristic definitions and thresholds for Cloud Security Anomaly Detection.
"""

BASELINE_API_RATE = 25  # Normal baseline is 10-25 req/min
HIGH_API_RATE_THRESHOLD = 200
CRITICAL_API_RATE_THRESHOLD = 500

FAILED_LOGIN_WARN_THRESHOLD = 3
FAILED_LOGIN_CRITICAL_THRESHOLD = 8

HIGH_RISK_COUNTRIES = ["RU", "CN", "IR", "KP", "RO", "UA"]

SENSITIVE_RESOURCES = {
    "RDS Database": 85,
    "S3 Bucket": 80,
    "IAM Role": 90,
    "API Gateway": 65,
    "EC2 Server": 60,
    "Virtual Network": 55,
    "Lambda Function": 50
}
