import React, { useEffect, useState } from 'react';
import {
  Flame,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { incidentService } from '../services/incidentService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatTimeAgo, formatDate } from '../utils/formatters';

export const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Update incident form
  const [timelineNote, setTimelineNote] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create incident form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState('High');
  const [newPriority, setNewPriority] = useState('P2');
  const [newResources, setNewResources] = useState('');
  const [newMitigation, setNewMitigation] = useState('');
  const [creating, setCreating] = useState(false);

  const toast = useToast();
  const { user } = useAuth();

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await incidentService.getIncidents({
        search,
        status: statusFilter,
        severity: severityFilter
      });
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      toast.error('Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter]);

  const handleOpenDetail = (incident) => {
    setSelectedIncident(incident);
    setUpdateStatus(incident.status);
    setTimelineNote('');
    setIsDetailModalOpen(true);
  };

  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      setUpdating(true);
      const res = await incidentService.updateIncident(selectedIncident._id, {
        status: updateStatus,
        timelineNote: timelineNote || undefined
      });
      if (res.success) {
        toast.success(`Incident ${selectedIncident.incidentId} updated successfully.`);
        setSelectedIncident(res.data);
        setTimelineNote('');
        setIncidents((prev) =>
          prev.map((inc) => (inc._id === selectedIncident._id ? res.data : inc))
        );
      }
    } catch (err) {
      toast.error('Failed to update incident.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const payload = {
        title: newTitle,
        description: newDescription,
        severity: newSeverity,
        priority: newPriority,
        affectedResources: newResources ? newResources.split(',').map((s) => s.trim()) : [],
        mitigationSteps: newMitigation || 'Initiate incident response procedures',
        assignedAnalystName: user?.name || 'Security Ops Team'
      };

      const res = await incidentService.createIncident(payload);
      if (res.success) {
        toast.success(`Incident ${res.data.incidentId} created!`);
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewResources('');
        setNewMitigation('');
        fetchIncidents();
      }
    } catch (err) {
      toast.error('Failed to create incident.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Security Incidents Response</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Active containment, forensic timelines, and root-cause analysis for correlated threat tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchIncidents} loading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search incident ID, title, description, or analyst..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchIncidents()}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Incident Statuses</option>
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Contained">Contained</option>
          <option value="Resolved">Resolved</option>
        </select>

        {/* Severity Filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Incidents Table / Cards */}
      <Card>
        <CardHeader
          title={`Security Incidents (${incidents.length})`}
          subtitle="Click on any incident ticket to review timeline updates and remediation status"
        />

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton lines={6} />
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No Incidents Found"
            description="No active incidents match your filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Analyst</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {incidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{inc.incidentId}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 font-bold rounded ${
                          inc.priority === 'P1'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : inc.priority === 'P2'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans max-w-sm">
                      <p className="font-semibold text-slate-200 truncate">{inc.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{inc.description}</p>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant="severity">{inc.severity}</Badge>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant="status">{inc.status}</Badge>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 truncate max-w-[130px]">
                      {inc.assignedAnalystName || 'Security Team'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans">{formatTimeAgo(inc.createdAt)}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenDetail(inc)}
                        className="text-xs"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detailed Incident Modal */}
      {selectedIncident && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Incident Response: [${selectedIncident.incidentId}] ${selectedIncident.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Incident Summary Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Priority</span>
                <span className="text-red-400 font-bold font-mono">{selectedIncident.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Severity</span>
                <Badge variant="severity">{selectedIncident.severity}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Current Status</span>
                <Badge variant="status">{selectedIncident.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Lead Analyst</span>
                <span className="text-slate-200 truncate block font-sans">
                  {selectedIncident.assignedAnalystName || 'SOC Ops Team'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Incident Description
              </h4>
              <p className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs leading-relaxed">
                {selectedIncident.description}
              </p>
            </div>

            {/* Affected Resources & Linked Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-400 font-medium block mb-1">Affected Cloud Resources:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedIncident.affectedResources?.length > 0 ? (
                    selectedIncident.affectedResources.map((res, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-cyan-300 font-mono rounded text-[11px]">
                        {res}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None linked</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-400 font-medium block mb-1">Linked Security Alerts:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedIncident.linkedAlerts?.length > 0 ? (
                    selectedIncident.linkedAlerts.map((alt, i) => (
                      <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-300 font-mono rounded text-[11px] border border-red-500/30">
                        {alt}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None linked</span>
                  )}
                </div>
              </div>
            </div>

            {/* Root Cause & Mitigation */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-400 font-semibold block mb-1">Root Cause Analysis:</span>
                <p className="text-slate-200">{selectedIncident.rootCause || 'Under investigation.'}</p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <span className="text-emerald-400 font-semibold block mb-1">Mitigation & Containment Steps:</span>
                <p className="text-emerald-200 whitespace-pre-line">{selectedIncident.mitigationSteps}</p>
              </div>
            </div>

            {/* Investigation Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Incident Response Timeline
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedIncident.timeline?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-200">{step.action}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(step.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{step.notes}</p>
                      <span className="text-[10px] text-cyan-400 mt-1 block">By: {step.performedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form to append status / timeline note */}
            <form onSubmit={handleUpdateIncident} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Append Timeline Update & Modify Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Incident Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Contained">Contained</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Investigation Note</label>
                  <input
                    type="text"
                    value={timelineNote}
                    onChange={(e) => setTimelineNote(e.target.value)}
                    placeholder="e.g. WAF rate limiting rule applied; egress IP blocked"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button variant="primary" size="sm" type="submit" loading={updating}>
                  Save Incident Update
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Create New Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Security Incident Ticket"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Incident Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Suspected AWS S3 Bucket Leakage"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Detailed Description
            </label>
            <textarea
              required
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe observed malicious activity and affected perimeter..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Severity Level
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="P1">P1 (Immediate Critical)</option>
                <option value="P2">P2 (High Priority)</option>
                <option value="P3">P3 (Medium)</option>
                <option value="P4">P4 (Low / Informational)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Affected Cloud Resources (comma-separated)
            </label>
            <input
              type="text"
              value={newResources}
              onChange={(e) => setNewResources(e.target.value)}
              placeholder="e.g. prod-web-frontend-01, cloudguard-public-api-gateway"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Immediate Mitigation Steps
            </label>
            <textarea
              rows={2}
              value={newMitigation}
              onChange={(e) => setNewMitigation(e.target.value)}
              placeholder="Initial containment guidance for on-duty analysts..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={creating}>
              Create Incident Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
