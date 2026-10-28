import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Server,
  AlertOctagon,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  BrainCircuit,
  Lock,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatTimeAgo, formatDate } from '../utils/formatters';

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981'
};

const RESOURCE_STATUS_COLORS = {
  Active: '#10b981',
  Warning: '#f59e0b',
  Critical: '#dc2626',
  Stopped: '#64748b'
};

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await dashboardService.getSummary();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-800/60 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  const {
    metrics,
    threatSeverityDistribution = [],
    resourceStatusDistribution = [],
    eventsByCategory = [],
    threatTrends = [],
    riskScoreTrends = [],
    recentEvents = []
  } = data || {};

  const score = metrics?.overallSecurityScore || 85;

  return (
    <div className="space-y-6">
      {/* Top Banner: Security Score + Quick Summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#111c2e] to-[#0d1e38] border border-cyan-500/20 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * score) / 100}
                  className={score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">{score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">/100</span>
              </div>
            </div>

            {/* Score Text */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Overall Cloud Security Score
                </h1>
                <Badge variant={score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red'}>
                  {score >= 80 ? 'Optimal' : score >= 60 ? 'Degraded' : 'Critical'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Continuous compliance posture across monitored AWS instances, VPC subnets, and object storage.
                Real-time threat evaluation via AI telemetry rules.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              loading={refreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/anomaly-detector')}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>AI Anomaly Suite</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Cloud Resources */}
        <Card hover onClick={() => navigate('/resources')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Resources</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics?.totalResources || 0}</span>
            <span className="text-xs text-emerald-400 flex items-center font-medium">
              100% Monitored
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">EC2, S3, RDS, API Gateway</p>
        </Card>

        {/* Card 2: Active Threats */}
        <Card hover onClick={() => navigate('/alerts')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Threats</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics?.activeThreats || 0}</span>
            <span className="text-xs text-orange-400 font-medium">High & Critical</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requiring SOC triage</p>
        </Card>

        {/* Card 3: Critical Alerts */}
        <Card hover onClick={() => navigate('/alerts')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Alerts</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-400">{metrics?.criticalAlerts || 0}</span>
            <span className="text-xs text-red-400 font-semibold px-1.5 py-0.5 rounded bg-red-500/10">
              Action Needed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Public access & API floods</p>
        </Card>

        {/* Card 4: Open Incidents */}
        <Card hover onClick={() => navigate('/incidents')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Incidents</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics?.openIncidents || 0}</span>
            <span className="text-xs text-amber-400 font-medium">Under Investigation</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Correlated security tickets</p>
        </Card>

        {/* Card 5: Total Active Alerts */}
        <Card hover onClick={() => navigate('/alerts')} className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Alerts</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics?.activeAlerts || 0}</span>
            <span className="text-xs text-cyan-400 font-medium">Live Queue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-stage triage</p>
        </Card>
      </div>

      {/* Charts Row 1: Threat Trends Over Time + Threat Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Threats Over Time (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Threat Activity & Frequency Over Time"
            subtitle="7-day volume breakdown across low, medium, high, and critical vectors"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={threatTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorCritical)" name="Critical" />
                <Area type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorHigh)" name="High" />
                <Area type="monotone" dataKey="medium" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMedium)" name="Medium" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Threat Severity Distribution Donut */}
        <Card>
          <CardHeader
            title="Threat Severity Breakdown"
            subtitle="Current active alerts classified by risk weight"
          />
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={threatSeverityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {threatSeverityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Security Events By Category + Resource Security Status + Risk Score Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Events By Category */}
        <Card>
          <CardHeader
            title="Events By Category"
            subtitle="Distribution of security telemetry events"
          />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={35} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Resource Security Status */}
        <Card>
          <CardHeader
            title="Resource Security Status"
            subtitle="Health state across registered cloud assets"
          />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Resources">
                  {resourceStatusDistribution.map((entry, index) => (
                    <Cell
                      key={`status-cell-${index}`}
                      fill={RESOURCE_STATUS_COLORS[entry.name] || '#06b6d4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Score Trends */}
        <Card>
          <CardHeader
            title="24-Hour Risk Score Trend"
            subtitle="Dynamic anomaly threat level curve"
          />
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskScoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d131f',
                    borderColor: '#1f293d',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Risk Score" />
                <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Safe Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Table: Recent Security Events */}
      <Card>
        <CardHeader
          title="Recent Security Events"
          subtitle="Real-time audit telemetry ingested from cloud instances"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/events')}
            >
              <span>View All Events</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Origin / User</th>
                <th className="py-3 px-4">Affected Resource</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentEvents.map((evt) => (
                <tr key={evt._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-cyan-400 font-medium">{evt.eventId}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">{evt.eventType}</td>
                  <td className="py-3 px-4 font-sans">
                    <Badge variant="severity">{evt.severity}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{evt.userOrIp}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{evt.resource}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-bold ${
                        evt.riskScore >= 80
                          ? 'text-red-400'
                          : evt.riskScore >= 60
                          ? 'text-orange-400'
                          : evt.riskScore >= 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {evt.riskScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-sans">
                    {formatTimeAgo(evt.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
