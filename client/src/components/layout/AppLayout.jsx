import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        closeMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar openMobile={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Simulated Cloud Telemetry Disclaimer Banner */}
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>
                <strong className="text-slate-200">Simulated Cloud Environment:</strong> CloudGuard AI is monitoring synthetic multi-cloud telemetry (AWS EC2, S3, RDS, WAF).
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-cyan-400/80">Demo Mode Active</span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
