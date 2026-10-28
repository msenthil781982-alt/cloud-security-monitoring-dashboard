/**
 * Utility formatters for CloudGuard AI
 */

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatTimeAgo(dateString) {
  if (!dateString) return 'Never';
  const d = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function getSeverityBadgeColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'high':
      return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  }
}

export function getStatusBadgeColor(status) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'resolved':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    case 'new':
    case 'open':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'investigating':
    case 'warning':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'contained':
      return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
    case 'false positive':
    case 'stopped':
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
  }
}

export function getRiskLevelBadge(score) {
  if (score >= 81) return { level: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
  if (score >= 61) return { level: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
  if (score >= 31) return { level: 'Medium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  return { level: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
}
