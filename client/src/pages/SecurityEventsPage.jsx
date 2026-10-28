import React, { useEffect, useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  AlertCircle,
  Shield,
  Eye,
  Key,
  Network,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo, formatDate } from '../utils/formatters';

const EVENT_CATEGORIES = [
  'Authentication',
  'Access Control',
  'Network',
  'API',
  'Data Protection'
];

export const SecurityEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toast = useToast();

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const res = await eventService.getEvents({
        page,
        limit: 15,
        search,
        severity: severityFilter,
        eventType: eventTypeFilter,
        resource: resourceFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      if (res.success) {
        setEvents(res.data);
        setTotal(res.total);
        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load security events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, [severityFilter, eventTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents(1);
  };

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Security Events Stream</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Audit logging and threat telemetry ingested across cloud infrastructure and API endpoints.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchEvents(currentPage)} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search event ID, IP/User, resource, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Severity */}
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

          {/* Event Type */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Event Types</option>
            <option value="Failed Login Attempt">Failed Login Attempt</option>
            <option value="Unauthorized Access">Unauthorized Access</option>
            <option value="Suspicious API Request">Suspicious API Request</option>
            <option value="Privilege Change">Privilege Change</option>
            <option value="Unusual Network Activity">Unusual Network Activity</option>
            <option value="Multiple Authentication Failures">Multiple Authentication Failures</option>
            <option value="Data Exfiltration Attempt">Data Exfiltration Attempt</option>
            <option value="Policy Violation">Policy Violation</option>
          </select>
        </form>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Filter Dates:</span>
          <div className="flex items-center gap-1.5">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => fetchEvents(1)}>
            Apply Filters
          </Button>
          {(startDate || endDate || search || severityFilter !== 'all' || eventTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSeverityFilter('all');
                setEventTypeFilter('all');
                setStartDate('');
                setEndDate('');
                setTimeout(() => fetchEvents(1), 50);
              }}
              className="text-cyan-400 hover:text-cyan-300 text-xs underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Stream Table */}
      <Card>
        <CardHeader
          title={`Security Events (${total} Total)`}
          subtitle="Showing live security event logs sorted by most recent timestamp"
        />

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton lines={8} />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Security Events Found"
            description="No events match your current filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Origin / User</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Detected</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">{evt.eventId}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">{evt.eventType}</td>
                    <td className="py-3 px-4 font-sans">
                      <Badge variant="severity">{evt.severity}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[130px]">{evt.userOrIp}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 truncate max-w-[150px]">{evt.resource}</td>
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
                    <td className="py-3 px-4 text-slate-400 font-sans">{formatTimeAgo(evt.timestamp)}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => handleOpenDetail(evt)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="View Event Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {currentPage} of {totalPages} ({total} entries)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => fetchEvents(currentPage - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchEvents(currentPage + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Security Event Details: ${selectedEvent.eventId}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Event Type</span>
                <span className="text-slate-100 font-semibold">{selectedEvent.eventType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Severity</span>
                <Badge variant="severity">{selectedEvent.severity}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">User / Origin IP</span>
                <span className="text-cyan-400 font-mono">{selectedEvent.userOrIp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Target Resource</span>
                <span className="text-slate-200">{selectedEvent.resource}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Category</span>
                <span className="text-slate-200">{selectedEvent.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Calculated Risk</span>
                <span className="font-mono text-red-400 font-bold">{selectedEvent.riskScore}/100</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Event Description
              </h4>
              <p className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 text-xs leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            {/* Metadata JSON preview */}
            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Metadata & Telemetry Context
                </h4>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Timestamp: {formatDate(selectedEvent.timestamp)}</span>
              <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
