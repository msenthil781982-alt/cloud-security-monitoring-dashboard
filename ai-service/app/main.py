"""
CloudGuard AI - Anomaly Detection Microservice
Provides REST endpoints for evaluating cloud security telemetry.
"""

import sys
import json
from .services.detector import AnomalyDetector

detector = AnomalyDetector()

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from .models.schemas import TelemetryPayload, AnomalyResponse

    app = FastAPI(
        title="CloudGuard AI Anomaly Detection Service",
        description="FastAPI microservice for cloud security telemetry anomaly scoring and behavioral risk assessment.",
        version="1.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health_check():
        return {
            "status": "healthy",
            "service": "CloudGuard AI Anomaly Service (FastAPI)",
            "model_version": detector.model_version
        }

    @app.post("/analyze")
    def analyze_telemetry(payload: TelemetryPayload):
        telemetry_dict = payload.model_dump() if hasattr(payload, 'model_dump') else payload.dict()
        result = detector.evaluate(telemetry_dict)
        return result

    @app.get("/rules")
    def get_rules():
        return {
            "rules": [
                {
                    "name": "API Flood Detection",
                    "threshold": ">= 500 req/min (Critical), >= 200 req/min (High)",
                    "description": "Flags automated DDoS or scraping against cloud endpoints."
                },
                {
                    "name": "Authentication Brute Force",
                    "threshold": ">= 8 failures (Critical), >= 3 failures (Medium)",
                    "description": "Flags credential stuffing and dictionary attacks against IAM or SSH."
                },
                {
                    "name": "S3 Public Bucket Policy",
                    "threshold": "Public access granted to Principal: *",
                    "description": "Flags inadvertent exposure of sensitive cloud object storage."
                },
                {
                    "name": "IAM Privilege Escalation",
                    "threshold": "AdministratorAccess policy modification",
                    "description": "Flags unauthorized permissions expansion."
                },
                {
                    "name": "Data Exfiltration Detection",
                    "threshold": ">= 30 GB egress data transfer",
                    "description": "Flags massive outbound data leakage."
                }
            ]
        }

except ImportError:
    # If FastAPI is not installed in the current environment, provide standard library fallback
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class FallbackHTTPHandler(BaseHTTPRequestHandler):
        def _set_headers(self, status=200):
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()

        def do_OPTIONS(self):
            self._set_headers(200)

        def do_GET(self):
            if self.path == '/health':
                self._set_headers(200)
                resp = {
                    "status": "healthy",
                    "service": "CloudGuard AI Service (Standard HTTP Fallback)",
                    "model_version": detector.model_version
                }
                self.wfile.write(json.dumps(resp).encode('utf-8'))
            elif self.path == '/rules':
                self._set_headers(200)
                resp = {"status": "ok", "service": "CloudGuard AI Engine"}
                self.wfile.write(json.dumps(resp).encode('utf-8'))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"detail": "Not Found"}).encode('utf-8'))

        def do_POST(self):
            if self.path == '/analyze':
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                try:
                    payload = json.loads(body) if body else {}
                except Exception:
                    payload = {}
                result = detector.evaluate(payload)
                self._set_headers(200)
                self.wfile.write(json.dumps(result).encode('utf-8'))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"detail": "Not Found"}).encode('utf-8'))

    app = None
