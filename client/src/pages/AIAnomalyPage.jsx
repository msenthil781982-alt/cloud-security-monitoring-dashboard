import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { anomalyService } from '../services/anomalyService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export const AIAnomalyPage = () => {
  const [scenarios, setScenarios] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Form parameters
  const [payload, setPayload] = useState({
    resourceName: 'prod-api-gateway-01',
    resourceType: 'API Gateway',
    apiRequestsPerMinute: 920,
    failedLoginCount: 0,
    geoCountry: 'RO',
    isOffHours: false,
    privilegeEscalationAttempt: false,
    publicBucketExposed: false,
    dataTransferVolumeGB: 2.1
  });

  const toast = useToast();

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await anomalyService.getScenarios();
        if (res.success) {
          setScenarios(res.data);
        }
      } catch (err) {
        console.error('Failed to load attack scenarios:', err);
      }
    };
    fetchScenarios();
  }, []);

  const handleRunAnalysis = async (customPayload) => {
    const targetPayload = customPayload || payload;
    try {
      setAnalyzing(true);
      const res = await anomalyService.analyze(targetPayload);
      if (res.success) {
        setResult(res.data);
        if (res.data.anomalyDetected) {
          toast.warning(`Anomaly Flagged! Severity: ${res.data.severity} (Score: ${res.data.riskScore})`);
        } else {
          toast.success('Telemetry normal. No security anomaly detected.');
        }
      }
    } catch (err) {
      toast.error('Failed to execute AI anomaly analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadScenario = (sc) => {
    setPayload(sc.payload);
    handleRunAnalysis(sc.payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              AI Security Anomaly Detection
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              FastAPI / Hybrid Rule Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Evaluate cloud telemetry parameters against heuristic behavioral baselines, request volume anomalies, and privilege indicators.
          </p>
        </div>
      </div>

      {/* Preset Scenario Quick-Run Buttons */}
      <Card>
        <CardHeader
          title="Instant Attack Scenarios (Viva Demonstration Presets)"
          subtitle="Click any scenario below to automatically inject telemetry and test the AI detector"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => loadScenario(sc)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-cyan-400 group-hover:text-cyan-300">
                  {sc.name}
                </span>
                <Zap className="w-3.5 h-3.5 text-cyan-400 opacity-70 group-hover:opacity-100" />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {sc.description}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Analysis Grid: Inputs on Left, AI Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Telemetry Parameters (7 Cols) */}
        <Card className="lg:col-span-6">
          <CardHeader
            title="Telemetry Simulation Controls"
            subtitle="Fine-tune network rates, authentication failures, and IAM flags"
          />

          <div className="space-y-4 text-xs">
            {/* Resource details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Cloud Resource</label>
                <input
                  type="text"
                  value={payload.resourceName}
                  onChange={(e) => setPayload({ ...payload, resourceName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Resource Type</label>
                <select
                  value={payload.resourceType}
                  onChange={(e) => setPayload({ ...payload, resourceType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="API Gateway">API Gateway</option>
                  <option value="EC2 Server">EC2 Server</option>
                  <option value="S3 Bucket">S3 Bucket</option>
                  <option value="RDS Database">RDS Database</option>
                  <option value="IAM Role">IAM Role</option>
                  <option value="Virtual Network">Virtual Network</option>
                </select>
              </div>
            </div>

            {/* Slider 1: API Requests per minute */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">API Requests / Minute</span>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {payload.apiRequestsPerMinute} req/min
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1200"
                step="10"
                value={payload.apiRequestsPerMinute}
                onChange={(e) =>
                  setPayload({ ...payload, apiRequestsPerMinute: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Idle)</span>
                <span>25 (Baseline)</span>
                <span>200 (High)</span>
                <span>500+ (Critical Flood)</span>
              </div>
            </div>

            {/* Slider 2: Failed Login Count */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">Failed Login Attempts</span>
                <span className="font-mono text-amber-400 font-bold text-sm">
                  {payload.failedLoginCount} attempts
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={payload.failedLoginCount}
                onChange={(e) =>
                  setPayload({ ...payload, failedLoginCount: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Normal)</span>
                <span>3 (Warn)</span>
                <span>8+ (Brute Force)</span>
              </div>
            </div>

            {/* Slider 3: Egress Data Transfer */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">Egress Data Transfer (GB)</span>
                <span className="font-mono text-purple-400 font-bold text-sm">
                  {payload.dataTransferVolumeGB} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={payload.dataTransferVolumeGB}
                onChange={(e) =>
                  setPayload({ ...payload, dataTransferVolumeGB: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.5 GB (Normal)</span>
                <span>15 GB</span>
                <span>30+ GB (Exfiltration)</span>
              </div>
            </div>

            {/* Boolean Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/60">
                <span className="text-slate-200">Public S3 Bucket ACL Exposure</span>
                <input
                  type="checkbox"
                  checked={payload.publicBucketExposed}
                  onChange={(e) => setPayload({ ...payload, publicBucketExposed: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/60">
                <span className="text-slate-200">Privilege Escalation (AdministratorAccess attach)</span>
                <input
                  type="checkbox"
                  checked={payload.privilegeEscalationAttempt}
                  onChange={(e) =>
                    setPayload({ ...payload, privilegeEscalationAttempt: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/60">
                <span className="text-slate-200">Off-Hours Maintenance Window Active</span>
                <input
                  type="checkbox"
                  checked={payload.isOffHours}
                  onChange={(e) => setPayload({ ...payload, isOffHours: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
              </label>
            </div>

            <Button
              variant="primary"
              className="w-full mt-3"
              onClick={() => handleRunAnalysis()}
              loading={analyzing}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Evaluate Telemetry with AI Detector</span>
            </Button>
          </div>
        </Card>

        {/* Right Output: AI Detection Verdict (5 Cols) */}
        <Card className="lg:col-span-6 flex flex-col justify-between">
          <CardHeader
            title="AI Detection Verdict & Risk Assessment"
            subtitle="Real-time analysis output generated by anomaly detector"
          />

          {result ? (
            <div className="space-y-4">
              {/* Verdict Header Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  result.anomalyDetected
                    ? 'bg-red-500/10 border-red-500/30 text-red-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.anomalyDetected ? (
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold tracking-tight">
                      {result.anomalyDetected ? 'SECURITY ANOMALY DETECTED' : 'NORMAL ACTIVITY VERIFIED'}
                    </h3>
                    <p className="text-xs opacity-80 mt-0.5">
                      {result.anomalyDetected
                        ? 'Threat indicators exceed normal operational thresholds.'
                        : 'Operating within safe baseline parameters.'}
                    </p>
                  </div>
                </div>

                <Badge variant={result.anomalyDetected ? 'red' : 'emerald'}>
                  {result.severity}
                </Badge>
              </div>

              {/* Numerical Risk Score Gauge */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Calculated Risk Score
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    Range: 0 (Safe) to 100 (Critical Compromise)
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-3xl font-extrabold font-mono ${
                      result.riskScore >= 80
                        ? 'text-red-400'
                        : result.riskScore >= 60
                        ? 'text-orange-400'
                        : result.riskScore >= 30
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {result.riskScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/100</span>
                </div>
              </div>

              {/* Explanation Reason */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  AI Detection Explanation
                </span>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-sans">
                  {result.explanation}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
                  Recommended SOC Containment Action
                </span>
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 leading-relaxed font-sans">
                  {result.recommendedAction}
                </div>
              </div>

              {/* Telemetry Engine Meta */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Engine: {result.engine}</span>
                <span>Evaluated: {new Date(result.analyzedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <BrainCircuit className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">Awaiting Telemetry Input</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Select an attack preset above or adjust the sliders and click <strong>Evaluate Telemetry</strong> to run the model.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
