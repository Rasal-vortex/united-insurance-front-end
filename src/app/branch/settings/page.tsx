import React, { useState } from 'react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [autoSync, setAutoSync] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
          <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
            Home
          </span>
          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          <span className="text-[#0f1c2e] font-bold">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight mt-1">System & Branch Preferences</h1>
        <p className="text-xs text-[#44474d]">
          Configure synchronization intervals, underwriting security thresholds, and dispatch alerts.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-[#002c26] text-[#93f4e3] rounded-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#e6eeff] p-6 shadow-xs flex flex-col gap-6">
        <div>
          <h2 className="text-sm font-bold text-[#0f1c2e] mb-1">Data Synchronization Engine</h2>
          <p className="text-xs text-[#44474d]">Controls background ledger updates with the central underwriter database.</p>
          <div className="mt-4 flex items-center justify-between p-3.5 bg-[#eff3ff] rounded-lg border border-[#d6e3fc]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0f1c2e]">Live 30-Second API Polling</span>
              <span className="text-[11px] text-[#44474d]">Automatically keeps claims and policy status in sync</span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 rounded text-[#002c26]"
            />
          </div>
        </div>

        <div className="h-px bg-[#e6eeff]"></div>

        <div>
          <h2 className="text-sm font-bold text-[#0f1c2e] mb-1">Underwriter Notifications & SLAs</h2>
          <p className="text-xs text-[#44474d]">Escalate claims exceeding 48h SLA appraisal boundaries.</p>
          <div className="mt-4 flex items-center justify-between p-3.5 bg-[#eff3ff] rounded-lg border border-[#d6e3fc]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0f1c2e]">Email Dispatch Alerts</span>
              <span className="text-[11px] text-[#44474d]">Send immediate dispatch email when claims are filed</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-[#002c26]"
            />
          </div>
        </div>

        <div className="h-px bg-[#e6eeff]"></div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#002c26] text-[#93f4e3] text-xs font-bold hover:opacity-95 shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
