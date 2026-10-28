# CloudGuard AI - Anomaly Detection Microservice

This microservice provides automated behavioral threat detection and risk scoring for the **CloudGuard AI** platform.

## Architecture

The AI Anomaly Service assesses multi-cloud telemetry (AWS EC2, S3, RDS, WAF) against statistical baselines and behavioral threat signatures:

- **Endpoint:** `http://127.0.0.1:8000`
- **Model Interface:** `AnomalyDetector` class in `app/services/detector.py`
- **Schemas:** Pydantic models in `app/models/schemas.py`
- **Rules & Heuristics:** `app/services/rules.py`

## Endpoints

### 1. `GET /health`
Returns health status and model version.

### 2. `POST /analyze`
Accepts cloud telemetry metrics and returns risk score, severity, explanation, and recommended action.

#### Request Body Example:
```json
{
  "resourceName": "prod-api-gateway-01",
  "resourceType": "API Gateway",
  "apiRequestsPerMinute": 920,
  "failedLoginCount": 0,
  "geoCountry": "RO",
  "isOffHours": false,
  "privilegeEscalationAttempt": false,
  "publicBucketExposed": false,
  "dataTransferVolumeGB": 2.1
}
```

#### Response Example:
```json
{
  "anomalyDetected": true,
  "riskScore": 58,
  "severity": "MEDIUM",
  "explanation": "Severe API flood anomaly detected: 920 req/min (Normal baseline is 25 req/min). Exceeds threshold by 3680%.",
  "recommendedAction": "Apply automated WAF rate limiting and temporarily quarantine suspect IP range.",
  "engine": "CloudGuard Hybrid AI Rule Engine (v1.2-rule-heuristic)",
  "confidence": 0.95,
  "analyzedAt": "2026-10-27T15:47:32.121950+00:00",
  "metrics": {
    "apiRequestsPerMinute": 920,
    "failedLoginCount": 0,
    "dataTransferVolumeGB": 2.1,
    "resourceType": "API Gateway",
    "geoCountry": "RO"
  }
}
```

### 3. `GET /rules`
Returns list of active detection thresholds and rule specifications.

## How to Run

```bash
cd ai-service
pip install -r requirements.txt
python run.py
```

*Note: The runner has a built-in fallback: if FastAPI/Uvicorn is installed, it runs using FastAPI; if running in a lightweight Python environment without pip packages, it uses the Python standard library HTTP server while maintaining the exact same REST API format.*
