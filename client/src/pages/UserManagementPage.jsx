import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Building,
  KeyRound,
  Lock,
  Unlock
} from 'lucide-react';
import { userService } from '../services/userService';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const toast = useToast();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      toast.error('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const res = await userService.updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setUpdatingId(userId);
      const res = await userService.toggleUserStatus(userId);
      if (res.success) {
        toast.success(`User account status modified.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">User Access Management</h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              Admin Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage administrative privileges, assign SOC analyst credentials, and revoke access permissions.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchUsers} loading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </Button>
      </div>

      {/* Users Card Table */}
      <Card>
        <CardHeader
          title={`Registered SOC Operators (${users.length})`}
          subtitle="Role-based access control (RBAC) permission configuration"
        />

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton lines={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users.map((u) => {
                  const isCurrent = u._id === currentUser?.id || u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-cyan-400 font-mono">(You)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 text-slate-400">{u.department || 'Security Operations'}</td>
                      <td className="py-3 px-4">
                        <select
                          disabled={isCurrent || updatingId === u._id}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-60"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Security Analyst">Security Analyst</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-400' : 'bg-red-400'
                            }`}
                          />
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <Button
                            variant={u.isActive ? 'ghost' : 'success'}
                            size="sm"
                            disabled={updatingId === u._id}
                            onClick={() => handleToggleStatus(u._id)}
                            className="text-xs"
                          >
                            {u.isActive ? (
                              <span className="text-red-400 hover:text-red-300">Deactivate</span>
                            ) : (
                              <span>Activate</span>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
