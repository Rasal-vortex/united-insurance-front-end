import { useState } from "react";

export const SettingsPage = ({ onNavigate }) => {
  const [autoSync, setAutoSync] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
          <span className="hover:text-[#302d36] cursor-pointer" onClick={() => onNavigate("/branch/dashboard")}>
            Home
          </span>
          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          <span className="text-[#302d36] font-bold">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-[#302d36] tracking-tight mt-1">System & Branch Preferences</h1>
        <p className="text-xs text-[#716d78]">Configure synchronization intervals, underwriting security thresholds, and dispatch alerts.</p>
      </div>

      {saved && (
        <div className="p-3 bg-[#7054a5] text-[#ffffff] rounded-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#f0eef3] p-6 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#302d36] mb-1">Data Synchronization Engine</h2>
          <p className="text-xs text-[#716d78]">Controls background ledger updates with the central underwriter database.</p>
          <div className="mt-4 flex items-center justify-between p-3.5 bg-[#f7f6f8] rounded-lg border border-[#e7e4eb]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#302d36]">Live 30-Second API Polling</span>
              <span className="text-[11px] text-[#716d78]">Automatically keeps claims and policy status in sync</span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 rounded text-[#7054a5]"
            />
          </div>
        </div>

        <div className="h-px bg-[#f0eef3]" />

        <div>
          <h2 className="text-sm font-bold text-[#302d36] mb-1">Underwriter Notifications & SLAs</h2>
          <p className="text-xs text-[#716d78]">Escalate claims exceeding 48h SLA appraisal boundaries.</p>
          <div className="mt-4 flex items-center justify-between p-3.5 bg-[#f7f6f8] rounded-lg border border-[#e7e4eb]">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#302d36]">Email Dispatch Alerts</span>
              <span className="text-[11px] text-[#716d78]">Send immediate dispatch email when claims are filed</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-[#7054a5]"
            />
          </div>
        </div>

        <div className="h-px bg-[#f0eef3]" />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#7054a5] text-[#ffffff] text-xs font-bold hover:opacity-95 shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
