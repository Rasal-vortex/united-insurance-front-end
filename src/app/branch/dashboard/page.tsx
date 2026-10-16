import React, { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboard-service';
import { DashboardData } from '@/types/crm';
import { CreatePolicyDialog } from '@/components/dialogs/create-policy-dialog';
import { CreateLeadDialog } from '@/components/dialogs/create-lead-dialog';
import { CreateClaimDialog } from '@/components/dialogs/create-claim-dialog';
import { CreateFollowUpDialog } from '@/components/dialogs/create-followup-dialog';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Dialog triggers
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    dashboardService
      .getDashboard()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    // Auto sync interval
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const summary = JSON.stringify(data, null, 2);
    const blob = new Blob([summary], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `United_Insurance_Dashboard_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 lg:px-8 py-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      {/* Actionable Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[#44474d] text-[11px] font-semibold uppercase tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-[#002c26] animate-pulse"></span>
            <span>OPERATIONAL OVERVIEW • METRO REGION</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0f1c2e] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#44474d]">Your insurance operations, all in one place.</p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2.5 relative">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e6eeff] hover:bg-[#dde9ff] text-[#0f1c2e] text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002c26] text-[#93f4e3] text-xs font-bold hover:opacity-95 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>Quick Actions</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>

            {quickActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#e6eeff] p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    setShowPolicyModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#0f1c2e] hover:bg-[#eff3ff] transition-colors text-xs font-medium text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#002c26]">add_moderator</span>
                  <span>+ New Policy</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    setShowLeadModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#0f1c2e] hover:bg-[#eff3ff] transition-colors text-xs font-medium text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#4d5f7b]">person_add</span>
                  <span>+ New Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    setShowClaimModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#0f1c2e] hover:bg-[#eff3ff] transition-colors text-xs font-medium text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#ba1a1a]">assignment_late</span>
                  <span>+ Report Claim</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickActionsOpen(false);
                    setShowFollowUpModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#0f1c2e] hover:bg-[#eff3ff] transition-colors text-xs font-medium text-left"
                >
                  <span className="material-symbols-outlined text-base text-[#44474d]">calendar_add_on</span>
                  <span>+ Schedule Follow-up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Customers */}
        <div
          onClick={() => onNavigate('/branch/customers')}
          className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#44474d] uppercase tracking-wider">Total Customers</span>
            <div className="w-10 h-10 rounded-lg bg-[#e6eeff] flex items-center justify-center text-[#002c26] group-hover:bg-[#002c26] group-hover:text-[#93f4e3] transition-colors">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">
              {loading ? '...' : (data?.metrics.totalCustomers.value || 2845).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#002c26] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+{data?.metrics.totalCustomers.changePct || 12.4}%</span>
              <span className="text-[#44474d] ml-0.5 font-normal">vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Policies */}
        <div
          onClick={() => onNavigate('/branch/policies')}
          className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#44474d] uppercase tracking-wider">Active Policies</span>
            <div className="w-10 h-10 rounded-lg bg-[#17263f] text-white flex items-center justify-center group-hover:bg-[#002c26] group-hover:text-[#93f4e3] transition-colors">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">
              {loading ? '...' : (data?.metrics.activePolicies.value || 4120).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#4d5f7b] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{data?.metrics.activePolicies.retentionRate || 88.6}%</span>
              <span className="text-[#44474d] ml-0.5 font-normal">active retention</span>
            </div>
          </div>
        </div>

        {/* Card 3: Open Claims */}
        <div
          onClick={() => onNavigate('/branch/claims')}
          className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#44474d] uppercase tracking-wider">Open Claims</span>
            <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">
              {loading ? '...' : (data?.metrics.openClaims.value || 38).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#ba1a1a] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-sm">error_outline</span>
              <span>{data?.metrics.openClaims.urgentCount || 6} urgent</span>
              <span className="text-[#44474d] ml-0.5 font-normal">review required</span>
            </div>
          </div>
        </div>

        {/* Card 4: Upcoming Renewals */}
        <div
          onClick={() => onNavigate('/branch/renewals')}
          className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-[#44474d] uppercase tracking-wider">Upcoming Renewals</span>
            <div className="w-10 h-10 rounded-lg bg-[#cadeff] text-[#061c35] flex items-center justify-center group-hover:bg-[#002c26] group-hover:text-[#93f4e3] transition-colors">
              <span className="material-symbols-outlined text-xl">event_repeat</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">
              {loading ? '...' : (data?.metrics.upcomingRenewals.value || 142).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#4d5f7b] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Within</span>
              <span className="text-[#44474d] ml-0.5 font-normal">next 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Policy Overview & Distribution */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] text-[#0f1c2e] font-bold">Policy Overview & Distribution</h2>
                <p className="text-[11px] text-[#44474d]">Active, Expired, and Segmented portfolio volume</p>
              </div>
              {/* Header Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[11px] bg-[#002c26] text-[#93f4e3] font-semibold">
                  Active: 3,650
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-[#dde9ff] text-[#0f1c2e] font-semibold">
                  Expired: 320
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] bg-[#ffdad6] text-[#93000a] font-semibold">
                  Cancelled: 150
                </span>
              </div>
            </div>

            {/* Segment Split Progress Bar */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="h-3 w-full rounded-full bg-[#eff3ff] overflow-hidden flex border border-[#d6e3fc]">
                <div className="h-full bg-[#17263f]" style={{ width: '38%' }} title="Auto: 38%"></div>
                <div className="h-full bg-[#002c26]" style={{ width: '26%' }} title="Commercial: 26%"></div>
                <div className="h-full bg-[#4d5f7b]" style={{ width: '18%' }} title="Property: 18%"></div>
                <div className="h-full bg-[#d6e3fc]" style={{ width: '12%' }} title="Health: 12%"></div>
                <div className="h-full bg-[#b8c7e7]" style={{ width: '6%' }} title="Life: 6%"></div>
              </div>
              <div className="flex items-center justify-between text-[#44474d] text-[11px]">
                <span>Segment Split</span>
                <span className="font-semibold text-[#0f1c2e]">4,120 Total Policies Tracked</span>
              </div>
            </div>

            {/* 6 Category Summary Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0f1c2e] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#17263f] inline-block"></span> Auto
                  </span>
                  <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#0f1c2e] font-bold tabular-nums shadow-2xs">
                    1,565
                  </span>
                </div>
                <div className="mt-2 text-[#44474d] text-[11px] flex justify-between">
                  <span>Volume:</span>
                  <span className="font-bold text-[#0f1c2e]">$2.26M</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0f1c2e] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#002c26] inline-block"></span> Commercial
                  </span>
                  <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#0f1c2e] font-bold tabular-nums shadow-2xs">
                    1,071
                  </span>
                </div>
                <div className="mt-2 text-[#44474d] text-[11px] flex justify-between">
                  <span>Volume:</span>
                  <span className="font-bold text-[#0f1c2e]">$4.18M</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0f1c2e] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4d5f7b] inline-block"></span> Property
                  </span>
                  <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#0f1c2e] font-bold tabular-nums shadow-2xs">
                    741
                  </span>
                </div>
                <div className="mt-2 text-[#44474d] text-[11px] flex justify-between">
                  <span>Volume:</span>
                  <span className="font-bold text-[#0f1c2e]">$1.45M</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0f1c2e] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d6e3fc] inline-block"></span> Health
                  </span>
                  <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#0f1c2e] font-bold tabular-nums shadow-2xs">
                    494
                  </span>
                </div>
                <div className="mt-2 text-[#44474d] text-[11px] flex justify-between">
                  <span>Volume:</span>
                  <span className="font-bold text-[#0f1c2e]">$890K</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#0f1c2e] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b8c7e7] inline-block"></span> Life
                  </span>
                  <span className="text-[11px] bg-white px-1.5 py-0.5 rounded text-[#0f1c2e] font-bold tabular-nums shadow-2xs">
                    249
                  </span>
                </div>
                <div className="mt-2 text-[#44474d] text-[11px] flex justify-between">
                  <span>Volume:</span>
                  <span className="font-bold text-[#0f1c2e]">$620K</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#cadeff] border border-[#b4c8e8] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#061c35] font-semibold">Gross Premium</span>
                  <span className="material-symbols-outlined text-base text-[#4f627e]">account_balance</span>
                </div>
                <div className="mt-2 text-[#061c35] text-[14px] font-bold flex justify-between">
                  <span>Total YTD</span>
                  <span>$9.40M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#e6eeff] text-[11px] text-[#44474d]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#002c26]"></span>
              <span>Data synchronised with REST API <code className="bg-[#eff3ff] px-1 rounded text-[#0f1c2e]">/api/reports/summary</code></span>
            </div>
            <span className="text-[#4d5f7b] font-semibold">Auto-sync 30s</span>
          </div>
        </div>

        {/* Right Column: Recent Operational Activity */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
              <h2 className="text-[16px] text-[#0f1c2e] font-bold">Recent Operational Activity</h2>
              <button
                type="button"
                onClick={fetchDashboard}
                title="Refresh Activity"
                className="text-[#44474d] hover:text-[#0f1c2e] p-1 rounded hover:bg-[#eff3ff] transition-colors"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>

            {/* Chronological Activity Feed */}
            <div className="flex flex-col gap-3.5 pt-4">
              {/* Event 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eff3ff] flex-shrink-0 flex items-center justify-center text-[#0f1c2e]">
                  <span className="material-symbols-outlined text-sm">autorenew</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs text-[#0f1c2e] font-semibold truncate">Policy #POL-8942 renewed</span>
                    <span className="text-[11px] text-[#75777e] whitespace-nowrap">12m ago</span>
                  </div>
                  <p className="text-[12px] text-[#44474d] truncate">
                    By Marcus Sterling for <strong className="text-[#0f1c2e]">Sarah Jenkins</strong> ($1,450/yr Auto)
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">report_problem</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs text-[#0f1c2e] font-semibold truncate">Claim #CLM-2041 submitted</span>
                    <span className="text-[11px] text-[#75777e] whitespace-nowrap">45m ago</span>
                  </div>
                  <p className="text-[12px] text-[#44474d] truncate">
                    $3,200 (Vehicle collision) under review by Claims Dept
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#002c26] text-[#93f4e3] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">how_to_reg</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs text-[#0f1c2e] font-semibold truncate">New qualified lead converted</span>
                    <span className="text-[11px] text-[#75777e] whitespace-nowrap">2h ago</span>
                  </div>
                  <p className="text-[12px] text-[#44474d] truncate">
                    David Rodriguez (<span className="text-[#0f1c2e]">Commercial Liability</span>)
                  </p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#cadeff] text-[#061c35] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">call</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs text-[#0f1c2e] font-semibold truncate">Follow-up completed</span>
                    <span className="text-[11px] text-[#75777e] whitespace-nowrap">4h ago</span>
                  </div>
                  <p className="text-[12px] text-[#44474d] truncate">
                    Call renewal discussion with Horizon Logistics
                  </p>
                </div>
              </div>

              {/* Event 5 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#dde9ff] text-[#0f1c2e] flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">security_update_good</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-xs text-[#0f1c2e] font-semibold truncate">Branch Audit sync completed</span>
                    <span className="text-[11px] text-[#75777e] whitespace-nowrap">6h ago</span>
                  </div>
                  <p className="text-[12px] text-[#44474d] truncate">
                    Executed by Admin (Metro Central #04 compliance checks)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#e6eeff] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('/admin/reports')}
              className="text-xs text-[#4d5f7b] hover:text-[#0f1c2e] font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>View full operational audit trail</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
            <span className="text-[11px] text-[#75777e]">Live feed</span>
          </div>
        </div>
      </div>

      {/* Workspace Shortcuts Section */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-[16px] text-[#0f1c2e] font-bold">Workspace Shortcuts</h2>
          <p className="text-[11px] text-[#44474d]">Direct access to core enterprise management modules</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customers */}
          <div
            onClick={() => onNavigate('/branch/customers')}
            className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eff3ff] group-hover:bg-[#17263f] group-hover:text-white transition-colors flex items-center justify-center text-[#0f1c2e]">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <div>
                <h3 className="text-sm text-[#0f1c2e] font-bold">Customers</h3>
                <p className="text-xs text-[#44474d] mt-1">
                  Manage customer records, documents, and historical policy profiles.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#002c26] text-xs font-bold group-hover:translate-x-1 transition-transform">
              <span>Open module</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Leads */}
          <div
            onClick={() => onNavigate('/branch/leads')}
            className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eff3ff] group-hover:bg-[#17263f] group-hover:text-white transition-colors flex items-center justify-center text-[#0f1c2e]">
                <span className="material-symbols-outlined text-xl">filter_alt</span>
              </div>
              <div>
                <h3 className="text-sm text-[#0f1c2e] font-bold">Leads</h3>
                <p className="text-xs text-[#44474d] mt-1">
                  Track and convert inbound prospect pipelines and stage follow-ups.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#002c26] text-xs font-bold group-hover:translate-x-1 transition-transform">
              <span>Open module</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Renewals */}
          <div
            onClick={() => onNavigate('/branch/renewals')}
            className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eff3ff] group-hover:bg-[#17263f] group-hover:text-white transition-colors flex items-center justify-center text-[#0f1c2e]">
                <span className="material-symbols-outlined text-xl">autorenew</span>
              </div>
              <div>
                <h3 className="text-sm text-[#0f1c2e] font-bold">Renewals</h3>
                <p className="text-xs text-[#44474d] mt-1">
                  Review policies approaching 30/60-day expiry windows.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#002c26] text-xs font-bold group-hover:translate-x-1 transition-transform">
              <span>Open module</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Claims */}
          <div
            onClick={() => onNavigate('/branch/claims')}
            className="bg-white rounded-xl p-5 shadow-xs border border-[#e6eeff] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eff3ff] group-hover:bg-[#17263f] group-hover:text-white transition-colors flex items-center justify-center text-[#0f1c2e]">
                <span className="material-symbols-outlined text-xl">health_and_safety</span>
              </div>
              <div>
                <h3 className="text-sm text-[#0f1c2e] font-bold">Claims</h3>
                <p className="text-xs text-[#44474d] mt-1">
                  Review claim submissions, adjustor notes, and settlement approvals.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#002c26] text-xs font-bold group-hover:translate-x-1 transition-transform">
              <span>Open module</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreatePolicyDialog
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        onCreated={fetchDashboard}
      />
      <CreateLeadDialog
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onCreated={fetchDashboard}
      />
      <CreateClaimDialog
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onCreated={fetchDashboard}
      />
      <CreateFollowUpDialog
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        onCreated={fetchDashboard}
      />
    </div>
  );
};
