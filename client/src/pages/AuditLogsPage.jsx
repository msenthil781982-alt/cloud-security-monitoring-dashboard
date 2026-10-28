import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { auditService } from '../services/auditService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatTimeAgo, formatDate } from '../utils/formatters';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const toast = useToast();

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await auditService.getAuditLogs({
        page,
        limit: 15,
        search,
        action: actionFilter
      });
      if (res.success) {
        setLogs(res.data);
        setTotal(res.total);
        setCurrentPage(res.currentPage);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">System Audit Trail</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable log of user logins, role authorizations, incident lifecycle updates, and triage modifications.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchLogs(currentPage)} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Trail</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search action, user name, description, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        {/* Action Filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Actions</option>
          <option value="User Login">User Login</option>
          <option value="User Logout">User Logout</option>
          <option value="User Registered">User Registered</option>
          <option value="Alert Status Changed">Alert Status Changed</option>
          <option value="Incident Created">Incident Created</option>
          <option value="Incident Updated">Incident Updated</option>
          <option value="Resource Checked">Resource Checked</option>
          <option value="Anomaly Analyzed">Anomaly Analyzed</option>
          <option value="User Role Changed">User Role Changed</option>
          <option value="Security Policy Updated">Security Policy Updated</option>
        </select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader
          title={`Audit Log Trail (${total} Recorded)`}
          subtitle="Chronological sequence of all security operations"
        />

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton lines={8} />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Audit Records Found"
            description="No audit logs match your filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Operator / User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-sans">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-200">
                      {log.userName || 'System'}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {log.userRole || 'System'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 truncate max-w-[130px]">
                      {log.resourceAffected || 'System'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-sm">
                      <p className="line-clamp-2">{log.description}</p>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => fetchLogs(currentPage - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => fetchLogs(currentPage + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
