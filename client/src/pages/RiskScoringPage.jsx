import React, { useState } from 'react';
import {
  Calculator,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code,
  Info,
  Server,
  Layers
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  computeClientRisk,
  SEVERITY_WEIGHTS,
  RESOURCE_WEIGHTS,
  RISK_LEVELS
} from '../utils/riskEngine';

export const RiskScoringPage = () => {
  const [severity, setSeverity] = useState('High');
  const [resourceType, setResourceType] = useState('S3 Bucket');
  const [frequency, setFrequency] = useState(25);
  const [isAuthFailure, setIsAuthFailure] = useState(false);
  const [isUnusualActivity, setIsUnusualActivity] = useState(true);

  // Compute live calculation
  const riskCalculation = computeClientRisk({
    severity,
    resourceType,
    frequency,
    isAuthFailure,
    isUnusualActivity
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Transparent Risk Scoring Engine
          </h1>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            Viva Ready
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Four-factor weighted risk quantification model: Event Severity (40%), Frequency (20%), Asset Sensitivity (20%), and Behavioral Indicators (20%).
        </p>
      </div>

      {/* Tiered Legend Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Low Risk</span>
            <span className="font-mono text-xs text-emerald-300 font-bold">0 – 30 pts</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Standard baseline operations, routine audits, and verified low-severity notices.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Risk</span>
            <span className="font-mono text-xs text-amber-300 font-bold">31 – 60 pts</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Isolated authentication failures, moderate API spikes, or staging resource drift.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">High Risk</span>
            <span className="font-mono text-xs text-orange-300 font-bold">61 – 80 pts</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Suspicious multi-IP access, unauthorized IAM alterations, or port reconnaissance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Risk</span>
            <span className="font-mono text-xs text-red-300 font-bold">81 – 100 pts</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Public S3 leakage, sustained DDoS flooding, or mass data exfiltration requiring immediate containment.
          </p>
        </div>
      </div>

      {/* Main Interactive Calculator Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 Cols) */}
        <Card className="lg:col-span-7">
          <CardHeader
            title="Interactive Risk Calculator"
            subtitle="Adjust the risk parameters to observe the live scoring breakdown"
          />

          <div className="space-y-4 text-xs">
            {/* Factor 1: Severity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                1. Base Event Severity (40% Weight)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Low', 'Medium', 'High', 'Critical'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      severity === lvl
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Factor 2: Resource Sensitivity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                2. Resource Sensitivity Index (20% Weight)
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {Object.keys(RESOURCE_WEIGHTS).map((type) => (
                  <option key={type} value={type}>
                    {type} (Sensitivity weight: {RESOURCE_WEIGHTS[type]}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* Factor 3: Event Frequency */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">
                  3. Frequency & Velocity Factor (20% Weight)
                </span>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {frequency} occurrences / min
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="600"
                step="5"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Factor 4: Behavioral flags */}
            <div className="space-y-2 pt-1">
              <span className="block text-slate-300 font-semibold uppercase tracking-wider">
                4. Behavioral Anomaly Indicators (20% Weight)
              </span>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/60">
                <span className="text-slate-200">Authentication Failure Involved (+35 pts factor)</span>
                <input
                  type="checkbox"
                  checked={isAuthFailure}
                  onChange={(e) => setIsAuthFailure(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/60">
                <span className="text-slate-200">AI Flagged Unusual Volume / Signature (+45 pts factor)</span>
                <input
                  type="checkbox"
                  checked={isUnusualActivity}
                  onChange={(e) => setIsUnusualActivity(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Right Output: Breakdown & Viva Formula (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader
              title="Live Score Calculation"
              subtitle="Weighted summation of composite threat parameters"
            />

            {/* Score Ring / Metric Display */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Final Evaluated Risk
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="severity">{riskCalculation.level}</Badge>
                  <span className="text-xs text-slate-400">
                    {riskCalculation.score >= 81
                      ? 'Immediate P1 alert'
                      : riskCalculation.score >= 61
                      ? 'P2 Alert generated'
                      : 'Logged in audit feed'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-4xl font-extrabold font-mono ${
                    riskCalculation.score >= 81
                      ? 'text-red-400'
                      : riskCalculation.score >= 61
                      ? 'text-orange-400'
                      : riskCalculation.score >= 31
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {riskCalculation.score}
                </span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
              </div>
            </div>

            {/* Breakdown Contributions */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider block">
                Component Contribution Breakdown:
              </span>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Severity Weight (40%)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  +{riskCalculation.breakdown.severityScore} pts
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Frequency Factor (20%)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  +{riskCalculation.breakdown.frequencyScore} pts
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Resource Sensitivity (20%)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  +{riskCalculation.breakdown.resourceScore} pts
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Behavioral Indicators (20%)</span>
                <span className="font-mono text-cyan-400 font-bold">
                  +{riskCalculation.breakdown.indicatorScore} pts
                </span>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Preview for Viva */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">Viva Formula Explanation</span>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 overflow-x-auto leading-relaxed">
              RiskScore = (Severity * 0.40) + (Frequency * 0.20) + (Sensitivity * 0.20) + (Indicators * 0.20)
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};
