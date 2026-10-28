import React, { useEffect, useState } from 'react';
import {
  Server,
  Database,
  FolderArchive,
  Network,
  Cpu,
  Key,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Check,
  X
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo, formatDate } from '../utils/formatters';

const TYPE_ICONS = {
  'EC2 Server': Cpu,
  'S3 Bucket': FolderArchive,
  'RDS Database': Database,
  'API Gateway': Network,
  'Virtual Network': Network,
  'Lambda Function': Cpu,
  'IAM Role': Key,
  'CloudTrail': ShieldCheck
};

export const CloudResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const toast = useToast();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceService.getResources({
        search,
        type: typeFilter,
        status: statusFilter,
        riskLevel: riskFilter
      });
      if (res.success) {
        setResources(res.data);
      }
    } catch (err) {
      toast.error('Failed to load cloud resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [typeFilter, statusFilter, riskFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleOpenDetail = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleTriggerScan = async (id) => {
    try {
      setScanning(true);
      const res = await resourceService.scanResource(id);
      if (res.success) {
        toast.success(`Security scan completed for ${res.data.name}!`);
        setSelectedResource(res.data);
        // Refresh local list
        setResources((prev) => prev.map((r) => (r._id === id ? res.data : r)));
      }
    } catch (err) {
      toast.error('Failed to execute scan.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Cloud Resources Monitoring</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time security posture, misconfiguration detection, and compliance status across monitored cloud assets.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchResources} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search resource name, ID, or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Resource Types</option>
          <option value="EC2 Server">EC2 Server</option>
          <option value="S3 Bucket">S3 Bucket</option>
          <option value="RDS Database">RDS Database</option>
          <option value="API Gateway">API Gateway</option>
          <option value="Virtual Network">Virtual Network</option>
          <option value="IAM Role">IAM Role</option>
          <option value="CloudTrail">CloudTrail</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Health Statuses</option>
          <option value="Active">Active</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
          <option value="Stopped">Stopped</option>
        </select>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
          <option value="Critical">Critical Risk</option>
        </select>
      </div>

      {/* Grid of Cloud Resources */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No Cloud Resources Found"
          description="No cloud resources match your filter criteria. Try adjusting the search parameters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((item) => {
            const Icon = TYPE_ICONS[item.type] || Server;
            return (
              <Card
                key={item._id}
                hover
                className="flex flex-col justify-between cursor-pointer border-slate-800 hover:border-cyan-500/40"
                onClick={() => handleOpenDetail(item)}
              >
                <div>
                  {/* Top line: Icon, Type, Provider & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                          {item.provider} • {item.type}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-100 truncate max-w-[180px]">
                          {item.name}
                        </h3>
                      </div>
                    </div>
                    <Badge variant="status">{item.status}</Badge>
                  </div>

                  {/* ID & Region */}
                  <div className="flex items-center justify-between text-xs text-slate-400 py-1.5 border-t border-slate-800/60 font-mono">
                    <span>Region: {item.region}</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[120px]">{item.resourceId}</span>
                  </div>

                  {/* Security Score Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Security Score</span>
                      <span
                        className={`font-bold font-mono ${
                          item.securityScore >= 80
                            ? 'text-emerald-400'
                            : item.securityScore >= 60
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {item.securityScore}/100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.securityScore >= 80
                            ? 'bg-emerald-500'
                            : item.securityScore >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${item.securityScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer details: Risk Level, Last Checked */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Risk:</span>
                    <Badge variant="severity">{item.riskLevel}</Badge>
                  </div>
                  <span>Checked {formatTimeAgo(item.lastChecked)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Resource Modal */}
      {selectedResource && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Resource Security Audit: ${selectedResource.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Top Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Resource ID</span>
                <span className="font-mono text-cyan-400 font-semibold">{selectedResource.resourceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Type & Cloud</span>
                <span className="text-slate-200">{selectedResource.type} ({selectedResource.provider})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Region</span>
                <span className="text-slate-200">{selectedResource.region}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Status</span>
                <Badge variant="status">{selectedResource.status}</Badge>
              </div>
            </div>

            {/* Security Score Gauge card */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Resource Security Rating</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated from encryption status, access permissions, open ports, and CVE exposure.
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-2xl font-bold font-mono ${
                    selectedResource.securityScore >= 80
                      ? 'text-emerald-400'
                      : selectedResource.securityScore >= 60
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedResource.securityScore}
                </span>
                <span className="text-xs text-slate-400 font-mono">/100</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Risk Level: <strong className="text-slate-200">{selectedResource.riskLevel}</strong>
                </div>
              </div>
            </div>

            {/* Configuration Security Checklist */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Security Controls & Hardening
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {/* Public Access */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Public Internet Access</span>
                  {selectedResource.configurationDetails?.publicAccess ? (
                    <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                      <X className="w-3.5 h-3.5" /> Exposed
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Private
                    </span>
                  )}
                </div>

                {/* Encryption at rest */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Encryption at Rest</span>
                  {selectedResource.configurationDetails?.encryptionEnabled ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> KMS Enabled
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                      <X className="w-3.5 h-3.5" /> Unencrypted
                    </span>
                  )}
                </div>

                {/* MFA Protection */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">MFA Delete / Auth</span>
                  {selectedResource.configurationDetails?.mfaEnabled ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Enforced
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Disabled
                    </span>
                  )}
                </div>

                {/* Automated Backups */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Snapshot Backups</span>
                  {selectedResource.configurationDetails?.backupEnabled ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Daily
                    </span>
                  ) : (
                    <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                      <X className="w-3.5 h-3.5" /> Missing
                    </span>
                  )}
                </div>

                {/* Firewall rules */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Firewall Rules</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {selectedResource.configurationDetails?.firewallRulesCount || 0} active
                  </span>
                </div>

                {/* Open Ports */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Open Ports</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {selectedResource.configurationDetails?.openPorts?.length > 0
                      ? selectedResource.configurationDetails.openPorts.join(', ')
                      : 'None (Secure)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vulnerabilities / CVE Section */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Detected Vulnerabilities & CVEs
              </h4>
              {selectedResource.vulnerabilities && selectedResource.vulnerabilities.length > 0 ? (
                <div className="space-y-2">
                  {selectedResource.vulnerabilities.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-semibold">{v.cve}</span>
                          <Badge variant="severity">{v.severity}</Badge>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              v.status === 'Remediated'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1">{v.title}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatTimeAgo(v.detectedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>No open critical or high CVE vulnerabilities detected on this instance.</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Last checked: {formatDate(selectedResource.lastChecked)}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTriggerScan(selectedResource._id)}
                  loading={scanning}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Run Security Audit</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
