import React, { useState, useEffect } from 'react';
import { Menu, Bell, ShieldCheck, Clock, Search, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertService } from '../../services/alertService';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ openMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');
  const [unreadAlerts, setUnreadAlerts] = useState([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Quick load recent critical alerts for notification drawer
    const loadAlerts = async () => {
      try {
        const res = await alertService.getAlerts({ status: 'New', limit: 4 });
        if (res.data) {
          setUnreadAlerts(res.data.slice(0, 4));
        }
      } catch (e) {
        // quiet fallback
      }
    };
    loadAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0e17]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Menu Button & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobile}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Security Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-cyber-pulse" />
          <span>SOC Active | Telemetry Monitored</span>
        </div>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3">
        {/* UTC Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time}</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0e17]" />
            )}
          </button>

          {showBellDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d131f] border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <span>Recent Security Alerts</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                  {unreadAlerts.length} New
                </span>
              </div>
              <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                {unreadAlerts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No new pending alerts.
                  </div>
                ) : (
                  unreadAlerts.map((alt) => (
                    <div
                      key={alt._id}
                      onClick={() => {
                        setShowBellDropdown(false);
                        navigate('/alerts');
                      }}
                      className="py-2.5 px-2 hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-medium text-slate-200 truncate">{alt.title}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span className="text-red-400 font-mono">Risk {alt.riskScore}/100</span>
                        <span>{alt.resource}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowBellDropdown(false);
                    navigate('/alerts');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  View All Alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
            <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">{user?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
