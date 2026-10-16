import React, { useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '@/types/crm';
import { claimService } from '@/services/claim-service';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { ClaimDetailModal } from '@/components/dialogs/claim-detail-modal';
import { CreateClaimDialog } from '@/components/dialogs/create-claim-dialog';

interface ClaimsPageProps {
  onNavigate: (path: string) => void;
}

export const ClaimsPage: React.FC<ClaimsPageProps> = ({ onNavigate }) => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPolicyType, setSelectedPolicyType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(38);

  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createClaimModalOpen, setCreateClaimModalOpen] = useState(false);
  const [rebalanceAlert, setRebalanceAlert] = useState(false);

  const fetchClaims = () => {
    setLoading(true);
    claimService
      .getClaims({
        page,
        limit,
        search: searchTerm,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      })
      .then((res) => {
        setClaims(res.data);
        setTotal(res.pagination.total);
      })
      .catch((err) => console.error('Failed to load claims:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, [page, selectedStatus]);

  const handleOpenDetail = (claim: Claim) => {
    setActiveClaim(claim);
    setDetailModalOpen(true);
  };

  const getStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#002c26] text-[#93f4e3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#93f4e3]"></span>
            APPROVED
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#cadeff] text-[#061c35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d5f7b]"></span>
            UNDER_REVIEW
          </span>
        );
      case 'REPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#dde9ff] text-[#061c35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d5f7b]"></span>
            REPORTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
            REJECTED
          </span>
        );
      case 'SETTLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#eff3ff] text-[#44474d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#75777e]"></span>
            SETTLED
          </span>
        );
      default:
        return null;
    }
  };

  const getPolicyTypeIcon = (prod?: string) => {
    const p = (prod || '').toLowerCase();
    if (p.includes('auto')) return 'directions_car';
    if (p.includes('home') || p.includes('hazard')) return 'home';
    if (p.includes('marine') || p.includes('vessel')) return 'directions_boat';
    if (p.includes('fleet') || p.includes('truck')) return 'local_shipping';
    if (p.includes('equipment') || p.includes('commercial')) return 'domain';
    return 'cottage';
  };

  const handleExportClaims = () => {
    const headers = ['Claim Number', 'Customer', 'Policy Number', 'Product', 'Claim Date', 'Amount', 'Status'];
    const rows = claims.map((c) => [
      c.claimNumber,
      c.customerName || '',
      c.policyNumber || '',
      c.policyProduct || '',
      c.claimDate,
      c.amount,
      c.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims_queue_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 lg:px-8 py-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[#44474d] text-xs font-semibold">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
              Home
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Claims</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-[#0f1c2e] tracking-tight">Claims Processing</h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dde9ff] text-[#061c35]">
              LIVE QUEUE
            </span>
          </div>
          <p className="text-sm text-[#44474d] max-w-2xl">
            Review claim reports, adjudicate adjustor evaluations, and track settlement disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportClaims}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#e6eeff] shadow-xs hover:bg-[#eff3ff] text-[#0f1c2e] text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#44474d]">ios_share</span>
            <span>Export Claims</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateClaimModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#002c26] text-[#93f4e3] hover:opacity-95 shadow-sm text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ File New Claim</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards with Inline Progress Elements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Pending Review */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cadeff] animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">
                Pending Review
              </span>
            </div>
            <span className="material-symbols-outlined text-[#4d5f7b] text-xl">pending_actions</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#0f1c2e] font-bold tabular-nums">14</span>
              <span className="text-sm text-[#44474d] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#4d5f7b] font-bold">$84,500</span>
              <span className="text-xs text-[#75777e]">in appraisal queue</span>
            </div>
          </div>
          <div className="mt-3 pt-1">
            <div className="flex justify-between items-center text-xs text-[#44474d] mb-1.5">
              <span>SLA Met (within 48h)</span>
              <span className="font-bold text-[#0f1c2e]">88%</span>
            </div>
            <div className="w-full bg-[#dde9ff] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4d5f7b] h-full rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Approved / Pending Payout */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#002c26]"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">
                Approved / Pending Payout
              </span>
            </div>
            <span className="material-symbols-outlined text-[#002c26] text-xl">account_balance</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#0f1c2e] font-bold tabular-nums">9</span>
              <span className="text-sm text-[#44474d] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#002c26] font-bold">$42,100</span>
              <span className="text-xs text-[#75777e]">scheduled for batch wire</span>
            </div>
          </div>
          <div className="mt-3 pt-1">
            <div className="flex justify-between items-center text-xs text-[#44474d] mb-1.5">
              <span>Direct Deposit Pre-Auth</span>
              <span className="font-bold text-[#0f1c2e]">100%</span>
            </div>
            <div className="w-full bg-[#dde9ff] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#002c26] h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Settled This Month */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f627e]"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">
                Settled This Month
              </span>
            </div>
            <span className="material-symbols-outlined text-[#17263f] text-xl">fact_check</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#0f1c2e] font-bold tabular-nums">45</span>
              <span className="text-sm text-[#44474d] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#0f1c2e] font-bold">$215,800</span>
              <span className="text-xs text-[#75777e]">closed & satisfied</span>
            </div>
          </div>
          <div className="mt-3 pt-1 flex items-center justify-between text-xs">
            <span className="text-[#44474d]">Avg. Adjudication Time</span>
            <span className="font-bold text-[#0f1c2e] bg-[#eff3ff] border border-[#d6e3fc] px-2 py-0.5 rounded">
              3.2 Calendar Days
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Strip & Controls */}
      <div className="flex flex-col gap-3 p-4 bg-white border border-[#e6eeff] rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#75777e] text-lg">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  fetchClaims();
                }
              }}
              placeholder="Search by claim #, customer name, policy #..."
              className="w-full pl-9 pr-4 py-2 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs text-[#0f1c2e] placeholder:text-[#75777e] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#002c26]"
            />
          </div>

          {/* Filter Dropdowns & Date Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={selectedPolicyType}
                onChange={(e) => setSelectedPolicyType(e.target.value)}
                className="appearance-none bg-[#eff3ff] border border-[#d6e3fc] pl-3 pr-8 py-2 rounded-lg text-xs font-semibold text-[#0f1c2e] focus:outline-none cursor-pointer"
              >
                <option value="">Policy Type: All</option>
                <option value="auto">Comprehensive Auto</option>
                <option value="home">Homeowner Hazard</option>
                <option value="commercial">Commercial Property</option>
                <option value="marine">Marine Cargo & Freight</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[#44474d] text-base pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="flex items-center bg-[#eff3ff] border border-[#d6e3fc] px-3 py-2 rounded-lg gap-2 cursor-pointer text-[#0f1c2e]">
              <span className="material-symbols-outlined text-sm text-[#44474d]">calendar_today</span>
              <span className="text-xs font-medium">Nov 01, 2024 - Today</span>
              <span className="material-symbols-outlined text-xs text-[#44474d]">arrow_drop_down</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('ALL');
                setSelectedPolicyType('');
                setPage(1);
              }}
              className="p-2 text-[#44474d] hover:text-[#0f1c2e] rounded-lg hover:bg-[#eff3ff] border border-[#d6e3fc] transition-colors"
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-2 border-t border-[#e6eeff]">
          <span className="text-[11px] text-[#44474d] font-bold uppercase mr-2 shrink-0">Filter Status:</span>
          {['ALL', 'REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                selectedStatus === st
                  ? 'bg-[#17263f] text-white shadow-xs'
                  : 'bg-[#eff3ff] text-[#44474d] hover:bg-[#dde9ff]'
              }`}
            >
              {st} {st === 'ALL' ? '(38)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Data Table */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e6eeff] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Claim Number</th>
                <th className="px-5 py-2">Customer</th>
                <th className="px-5 py-2">Related Policy</th>
                <th className="px-5 py-2">Claim Date</th>
                <th className="px-5 py-2 text-right">Claim Amount</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff] text-xs text-[#0f1c2e]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[#002c26]">refresh</span>
                    <p className="mt-2 text-xs">Loading queue adjudication records...</p>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    <span className="material-symbols-outlined text-4xl text-[#75777e]">fact_check</span>
                    <p className="mt-2 text-sm font-semibold text-[#0f1c2e]">No claims matching filters</p>
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#eff3ff]/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#002c26] text-base">
                          {getPolicyTypeIcon(c.policyProduct)}
                        </span>
                        <span className="font-mono font-bold text-[#0f1c2e] group-hover:text-[#002c26] transition-colors">
                          {c.claimNumber}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#cadeff] flex items-center justify-center text-[#061c35] text-xs font-bold">
                          {getInitials(c.customerName || 'Cust')}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0f1c2e] leading-tight truncate">
                            {c.customerName || 'Insured Claimant'}
                          </span>
                          <span className="text-[11px] text-[#75777e]">
                            {c.customerPhone || '+1 (212) 555-0199'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[#0f1c2e]">
                          {c.policyNumber || 'POL-8942'}
                        </span>
                        <span className="text-[11px] text-[#44474d] truncate">
                          {c.policyProduct || 'Comprehensive Auto'}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[#44474d]">{formatDate(c.claimDate)}</td>

                    <td className="px-5 py-3.5 text-right font-mono font-bold text-[#0f1c2e] text-sm tabular-nums">
                      {formatCurrency(c.amount)}
                    </td>

                    <td className="px-5 py-3.5 text-center">{getStatusBadge(c.status)}</td>

                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c)}
                          title="View Claim Details"
                          className="p-1 rounded-md hover:bg-[#eff3ff] text-[#44474d] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c)}
                          title="More Actions"
                          className="p-1 rounded-md hover:bg-[#eff3ff] text-[#44474d] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footnote */}
        <div className="px-5 py-3 bg-[#eff3ff]/70 border-t border-[#e6eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#44474d]">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#0f1c2e] font-bold">{claims.length}</strong> of{' '}
              <strong className="text-[#0f1c2e] font-bold">{total}</strong> Open Claims
            </span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#d6e3fc]"></span>
            <span className="hidden md:inline-block text-[11px] text-[#75777e]">
              Sync: Live via Core Policy Engine API
            </span>
          </div>

          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-md bg-white border border-[#d6e3fc] text-[#44474d] hover:bg-[#eff3ff] font-semibold text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span> Prev
            </button>
            <button
              type="button"
              onClick={() => setPage(1)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                page === 1 ? 'bg-[#17263f] text-white shadow-xs' : 'bg-white border border-[#d6e3fc] text-[#0f1c2e]'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setPage(2)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                page === 2 ? 'bg-[#17263f] text-white shadow-xs' : 'bg-white border border-[#d6e3fc] text-[#0f1c2e]'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setPage(3)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                page === 3 ? 'bg-[#17263f] text-white shadow-xs' : 'bg-white border border-[#d6e3fc] text-[#0f1c2e]'
              }`}
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setPage(4)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                page === 4 ? 'bg-[#17263f] text-white shadow-xs' : 'bg-white border border-[#d6e3fc] text-[#0f1c2e]'
              }`}
            >
              4
            </button>
            <button
              type="button"
              disabled={page >= 4}
              onClick={() => setPage((p) => Math.min(4, p + 1))}
              className="px-2.5 py-1.5 rounded-md bg-white border border-[#d6e3fc] text-[#0f1c2e] hover:bg-[#eff3ff] font-semibold text-xs flex items-center gap-1 disabled:opacity-40"
            >
              Next <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supplementary Insights Bento Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-4">
        {/* Weekly Settlement Velocity Gauge */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0f1c2e]">Weekly Settlement Velocity</h3>
              <p className="text-[11px] text-[#44474d]">Claims closed within SLA boundary</p>
            </div>
            <span className="material-symbols-outlined text-[#002c26] text-xl">speed</span>
          </div>

          <div className="py-4 flex flex-col items-center justify-center">
            <svg className="w-44 h-24" viewBox="0 0 100 55">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e6eeff"
                strokeLinecap="round"
                strokeWidth="8"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 76 22"
                fill="none"
                stroke="#002c26"
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="text-center -mt-6">
              <span className="text-2xl font-bold text-[#0f1c2e] tracking-tight">91.4%</span>
              <span className="block text-[11px] text-[#002c26] font-bold">+3.8% vs last cycle</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#44474d] border-t border-[#e6eeff] pt-3">
            <span>Target Metric: 85%</span>
            <span className="text-[#0f1c2e] font-semibold">Auto-Adjudication: 42%</span>
          </div>
        </div>

        {/* Lead Field Adjusters */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-[#0f1c2e]">Lead Field Adjusters</h3>
              <p className="text-[11px] text-[#44474d]">Active workload per claims specialist</p>
            </div>
            <span className="material-symbols-outlined text-[#75777e] text-xl">badge</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#eff3ff] border border-[#d6e3fc]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#17263f] text-white flex items-center justify-center text-xs font-bold">
                  JT
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0f1c2e]">Julian Thorne</span>
                  <span className="text-[11px] text-[#44474d]">Property & Marine</span>
                </div>
              </div>
              <span className="text-xs bg-[#dde9ff] px-2 py-0.5 rounded text-[#061c35] font-bold">
                6 Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#eff3ff] border border-[#d6e3fc]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#002c26] text-[#93f4e3] flex items-center justify-center text-xs font-bold">
                  EC
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0f1c2e]">Elena Cruz</span>
                  <span className="text-[11px] text-[#44474d]">Auto Collision</span>
                </div>
              </div>
              <span className="text-xs bg-[#dde9ff] px-2 py-0.5 rounded text-[#061c35] font-bold">
                8 Active
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRebalanceAlert(true);
              setTimeout(() => setRebalanceAlert(false), 2000);
            }}
            className="mt-3 w-full py-2 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] hover:bg-[#dde9ff] text-xs font-bold rounded-lg transition-colors text-center"
          >
            {rebalanceAlert ? 'Adjuster Workload Balanced ✓' : 'Rebalance Claims Load'}
          </button>
        </div>

        {/* Fraud Detection Engine */}
        <div className="p-5 rounded-xl bg-white border border-[#e6eeff] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-[#0f1c2e]">Fraud Detection Engine</h3>
              <p className="text-[11px] text-[#44474d]">Automated pattern anomaly monitor</p>
            </div>
            <span className="material-symbols-outlined text-[#4d5f7b] text-xl">shield</span>
          </div>

          <div className="my-2 p-3.5 rounded-lg bg-[#cadeff]/40 border border-[#b4c8e8] flex items-start gap-3">
            <span className="material-symbols-outlined text-[#061c35] text-lg mt-0.5">policy</span>
            <div>
              <span className="text-xs text-[#061c35] font-bold block">No Anomaly Flags Detected</span>
              <p className="text-[11px] text-[#354862] mt-0.5 leading-relaxed">
                Claim submissions matched against national casualty index with zero duplicate VIN or address collisions in the current cycle.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#44474d] border-t border-[#e6eeff] pt-3">
            <span className="flex items-center gap-1 font-semibold text-[#002c26]">
              <span className="material-symbols-outlined text-sm">verified</span> Engine Active
            </span>
            <span className="text-[#0f1c2e] font-semibold">Guardrails Active</span>
          </div>
        </div>
      </div>

      {/* Slide-over Modals */}
      <ClaimDetailModal
        claim={activeClaim}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onUpdated={fetchClaims}
      />

      <CreateClaimDialog
        isOpen={createClaimModalOpen}
        onClose={() => setCreateClaimModalOpen(false)}
        onCreated={fetchClaims}
      />
    </div>
  );
};
