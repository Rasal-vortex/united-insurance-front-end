import React, { useState, useEffect } from 'react';
import { Branch } from '@/types/crm';
import { apiClient } from '@/lib/api-client';
import { CreateBranchDialog } from '@/components/dialogs/create-branch-dialog';

interface BranchesPageProps {
  onNavigate: (path: string) => void;
}

export const BranchesPage: React.FC<BranchesPageProps> = ({ onNavigate }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBranches = () => {
    setLoading(true);
    apiClient<{ data: Branch[]; total: number }>('/api/branches')
      .then((res) => setBranches(res.data))
      .catch((err) => {
        console.error('Failed to load branches:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filteredBranches = branches.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      b.managerUsername.toLowerCase().includes(q)
    );
  });

  const handleExportDirectory = () => {
    const headers = ['Branch Name', 'Code', 'Manager', 'Phone', 'Email', 'Address', 'Staff', 'Status'];
    const rows = branches.map((b) => [
      b.name,
      b.code,
      b.managerUsername,
      b.phone,
      b.email,
      b.address,
      b.staffCount || 10,
      b.active ? 'ACTIVE' : 'INACTIVE',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branch_directory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 lg:px-8 py-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-[#44474d] text-xs font-semibold mb-1">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/admin/reports')}>
              Administration
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Branches</span>
            <span className="bg-[#cadeff] text-[#061c35] text-[10px] font-bold px-2 py-0.5 rounded ml-2">
              ADMIN ONLY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#021129] tracking-tight">
              Branch Management & Directory
            </h1>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#dde9ff] text-[#0f1c2e] text-xs font-bold">
              {branches.length}
            </span>
          </div>
          <p className="text-xs text-[#44474d] mt-1 max-w-2xl">
            Manage enterprise branch locations, credentials, operational codes, and regional coverage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportDirectory}
            className="flex items-center gap-1.5 bg-[#eff3ff] hover:bg-[#dde9ff] text-[#021129] text-xs font-bold px-4 py-2.5 rounded-lg border border-[#d6e3fc] shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all group cursor-pointer"
          >
            <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-90">add</span>
            <span>+ Create Branch</span>
          </button>
        </div>
      </div>

      {/* Admin Notice Banner */}
      <div className="bg-[#eff3ff] rounded-xl p-4 border border-[#d6e3fc] shadow-xs flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#dde9ff] flex items-center justify-center shrink-0 text-[#021129]">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#021129]">Administrator Authorization Active</span>
            <span className="bg-[#002c26] text-[#93f4e3] text-[10px] font-bold px-2 py-0.5 rounded">
              Security Tier 1
            </span>
          </div>
          <p className="text-xs text-[#44474d] mt-0.5">
            You have permission to provision branch entities and view cross-branch operational records. Branch managers
            log in with individual credentials.
          </p>
        </div>
        <div className="flex items-center gap-1 text-[#44474d] shrink-0 text-[11px] font-semibold">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Audit Logged</span>
        </div>
      </div>

      {/* 4 Stats Bento Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44474d]">Active Branches</span>
            <span className="material-symbols-outlined text-[#021129] text-xl">domain</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl text-[#021129] font-bold tabular-nums">4</span>
            <span className="text-[11px] font-bold text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded">
              100% Operational
            </span>
          </div>
          <span className="text-[11px] text-[#44474d] mt-1">Spans 4 major US metropolitan hubs</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44474d]">Assigned Staff</span>
            <span className="material-symbols-outlined text-[#021129] text-xl">badge</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl text-[#021129] font-bold tabular-nums">69</span>
            <span className="text-[11px] font-bold text-[#4f627e] bg-[#cadeff] px-2 py-0.5 rounded">
              +6 this month
            </span>
          </div>
          <span className="text-[11px] text-[#44474d] mt-1">Brokers, underwriters & claim leads</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44474d]">Regional Underwriting</span>
            <span className="material-symbols-outlined text-[#021129] text-xl">policy</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl text-[#021129] font-bold tabular-nums">$42.8M</span>
            <span className="text-[11px] font-bold text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded">
              FY24 YTD
            </span>
          </div>
          <span className="text-[11px] text-[#44474d] mt-1">Cross-branch cumulative GWP volume</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#44474d]">System Gateway</span>
            <span className="material-symbols-outlined text-[#021129] text-xl">terminal</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl text-[#021129] font-bold tabular-nums">99.98%</span>
            <span className="text-[11px] font-bold text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded">
              Healthy
            </span>
          </div>
          <span className="text-[11px] text-[#44474d] mt-1">Provisioning latency avg 82ms</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e6eeff] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96 flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#75777e] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search branches by name, branch code, city..."
            className="w-full pl-9 pr-4 py-2 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-xs rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#002c26]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-[#eff3ff] border border-[#d6e3fc] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#021129] shadow-xs'
                  : 'text-[#44474d] hover:text-[#0f1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-base">table_rows</span>
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-[#021129] shadow-xs'
                  : 'text-[#44474d] hover:text-[#0f1c2e]'
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span>Cards</span>
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] text-xs font-medium px-3 py-2 rounded-lg"
          >
            <span className="material-symbols-outlined text-base">filter_list</span>
            <span>Status: Active</span>
          </button>

          <button
            type="button"
            onClick={fetchBranches}
            className="p-2 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] text-[#44474d] hover:text-[#0f1c2e] transition-colors"
            title="Reload Records"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-xs border border-[#e6eeff] overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                  <th className="py-2.5 px-4 font-bold">Branch Entity</th>
                  <th className="py-2.5 px-4 font-bold">Code & Manager ID</th>
                  <th className="py-2.5 px-4 font-bold">Primary Contact</th>
                  <th className="py-2.5 px-4 font-bold">Physical Location</th>
                  <th className="py-2.5 px-4 font-bold text-center">Staff Count</th>
                  <th className="py-2.5 px-4 font-bold text-center">Status</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eeff] text-xs text-[#0f1c2e]">
                {filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#eff3ff]/50 transition-colors">
                    {/* Branch Entity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#dde9ff] flex items-center justify-center text-[#021129] font-bold text-xs shrink-0">
                          {b.code.split('-')[1] || 'BR'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[#021129] truncate">{b.name}</span>
                          <span className="text-[11px] text-[#44474d]">{b.region}</span>
                        </div>
                      </div>
                    </td>

                    {/* Code & Manager ID */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#021129] bg-[#eff3ff] px-2 py-0.5 rounded w-fit border border-[#d6e3fc]">
                          {b.code}
                        </span>
                        <span className="text-[11px] text-[#44474d] mt-1 flex items-center gap-1 font-mono">
                          <span className="material-symbols-outlined text-xs">account_circle</span>
                          {b.managerUsername}
                        </span>
                      </div>
                    </td>

                    {/* Primary Contact */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0f1c2e]">{b.phone}</span>
                        <span className="text-[11px] text-[#4d5f7b] hover:underline cursor-pointer">{b.email}</span>
                      </div>
                    </td>

                    {/* Physical Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-1 max-w-xs">
                        <span className="material-symbols-outlined text-sm text-[#75777e] shrink-0 mt-0.5">
                          location_on
                        </span>
                        <span className="line-clamp-1 text-[#44474d]" title={b.address}>
                          {b.address}
                        </span>
                      </div>
                    </td>

                    {/* Staff Count */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-[#eff3ff] border border-[#d6e3fc] px-2.5 py-1 rounded-full text-xs font-bold text-[#021129]">
                        <span className="material-symbols-outlined text-xs">groups</span>
                        <span>{b.staffCount || 16}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#002c26] text-[#93f4e3] px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#93f4e3]"></span>
                        ACTIVE
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Manage Credentials"
                          className="p-1.5 rounded hover:bg-[#eff3ff] text-[#44474d] hover:text-[#021129] transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">key</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('/branch/dashboard')}
                          title="Branch Details"
                          className="p-1.5 rounded hover:bg-[#eff3ff] text-[#44474d] hover:text-[#021129] transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">open_in_new</span>
                        </button>
                        <button
                          type="button"
                          title="Actions Menu"
                          className="p-1.5 rounded hover:bg-[#eff3ff] text-[#44474d] hover:text-[#021129] transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Metadata */}
          <div className="p-4 bg-[#eff3ff]/70 border-t border-[#e6eeff] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#44474d]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-[#0f1c2e] font-bold">{filteredBranches.length} of {branches.length}</strong> authorized branches
              </span>
              <span>•</span>
              <span className="text-[11px]">Database synchronization: Live (cluster us-east-1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#75777e]">Page 1 of 1</span>
            </div>
          </div>
        </div>
      ) : (
        /* Alternative Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBranches.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-xl border border-[#e6eeff] shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#021129] bg-[#eff3ff] px-2 py-0.5 rounded border border-[#d6e3fc]">
                    {b.code}
                  </span>
                  <span className="text-[11px] font-bold bg-[#002c26] text-[#93f4e3] px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#021129] mt-3 group-hover:text-[#4d5f7b] transition-colors">
                  {b.name}
                </h2>
                <p className="text-[11px] text-[#44474d] mt-0.5">
                  Manager ID: <span className="font-mono font-bold text-[#0f1c2e]">{b.managerUsername}</span>
                </p>

                <div className="mt-4 flex flex-col gap-1.5 text-xs text-[#44474d]">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-sm">call</span>
                    {b.phone}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-sm">mail</span>
                    {b.email}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-sm">home_pin</span>
                    {b.address}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center justify-between bg-[#eff3ff] -mx-5 -mb-5 px-5 py-2.5 rounded-b-xl border-t border-[#d6e3fc]">
                <span className="text-xs text-[#44474d] font-semibold">{b.staffCount || 18} Staff Members</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/branch/dashboard')}
                  className="text-[#021129] hover:text-[#002c26] text-xs font-bold"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Drawer for Create Branch */}
      <CreateBranchDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchBranches}
      />
    </div>
  );
};
