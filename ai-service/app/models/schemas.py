"""
Data schemas for CloudGuard AI Anomaly Service.
Supports Pydantic v2 if installed, with standard dataclass fallback.
"""
try:
    from pydantic import BaseModel, Field
    from typing import Optional, List, Dict, Any

    class TelemetryPayload(BaseModel):
        resourceName: Optional[str] = Field(default="generic-cloud-instance", description="Name of cloud resource")
        resourceType: Optional[str] = Field(default="EC2 Server", description="Resource type: EC2, S3, RDS, API Gateway, etc.")
        apiRequestsPerMinute: Optional[int] = Field(default=10, description="Observed API requests per minute")
        failedLoginCount: Optional[int] = Field(default=0, description="Consecutive failed authentication attempts")
        geoCountry: Optional[str] = Field(default="US", description="Origin geographic country code")
        isOffHours: Optional[bool] = Field(default=False, description="Whether activity occurs during designated off-hours")
        privilegeEscalationAttempt: Optional[bool] = Field(default=False, description="Flag indicating unauthorized IAM policy changes")
        publicBucketExposed: Optional[bool] = Field(default=False, description="Flag indicating S3 bucket public access violation")
        dataTransferVolumeGB: Optional[float] = Field(default=0.5, description="Egress data volume in GB")

    class AnomalyResponse(BaseModel):
        anomalyDetected: bool
        riskScore: int
        severity: str
        explanation: str
        recommendedAction: str
        engine: str
        confidence: float
        analyzedAt: str
        metrics: Dict[str, Any]

except ImportError:
    # Lightweight fallback representation without pydantic
    class TelemetryPayload:
        def __init__(self, **kwargs):
            self.resourceName = kwargs.get("resourceName", "generic-cloud-instance")
            self.resourceType = kwargs.get("resourceType", "EC2 Server")
            self.apiRequestsPerMinute = int(kwargs.get("apiRequestsPerMinute", 10))
            self.failedLoginCount = int(kwargs.get("failedLoginCount", 0))
            self.geoCountry = kwargs.get("geoCountry", "US")
            self.isOffHours = bool(kwargs.get("isOffHours", False))
            self.privilegeEscalationAttempt = bool(kwargs.get("privilegeEscalationAttempt", False))
            self.publicBucketExposed = bool(kwargs.get("publicBucketExposed", False))
            self.dataTransferVolumeGB = float(kwargs.get("dataTransferVolumeGB", 0.5))

        def dict(self):
            return self.__dict__
