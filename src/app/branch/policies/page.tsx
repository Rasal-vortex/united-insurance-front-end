import React, { useState, useEffect } from 'react';
import { Policy } from '@/types/crm';
import { policyService } from '@/services/policy-service';
import { formatCurrency, formatDate, getDaysLeft, getInitials } from '@/lib/utils';
import { CreatePolicyDialog } from '@/components/dialogs/create-policy-dialog';
import { CreateClaimDialog } from '@/components/dialogs/create-claim-dialog';

interface PoliciesPageProps {
  onNavigate: (path: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ onNavigate }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsurer, setSelectedInsurer] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(4120);
  const [totalPages, setTotalPages] = useState(412);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState<Policy | null>(null);
  const [syncTime, setSyncTime] = useState('Today, ' + new Date().toLocaleTimeString());
  const [latency, setLatency] = useState(28);

  const fetchPolicies = () => {
    setLoading(true);
    const params: any = {
      page,
      limit,
      search: searchTerm,
      status: activeTab === 'ALL' ? undefined : activeTab,
      insurer: selectedInsurer || undefined,
    };

    policyService
      .getPolicies(params)
      .then((res) => {
        setPolicies(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        if (res.latencyMs) setLatency(res.latencyMs);
        setSyncTime('Today, ' + new Date().toLocaleTimeString());
      })
      .catch((err) => console.error('Failed to load policies:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicies();
  }, [page, limit, activeTab, selectedInsurer]);

  // Handle Search submit
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchPolicies();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInsurer('');
    setActiveTab('ALL');
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(policies.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    const headers = ['Policy Number', 'Customer', 'Insurer', 'Product', 'Type', 'Premium', 'Start Date', 'Expiry Date', 'Status'];
    const rows = policies.map((p) => [
      p.policyNumber,
      p.customerName || '',
      p.insurer,
      p.product,
      p.policyType,
      p.premium,
      p.startDate,
      p.expiryDate,
      p.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policies_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProductIcon = (product: string) => {
    const p = product.toLowerCase();
    if (p.includes('auto') || p.includes('motor')) return 'directions_car';
    if (p.includes('property') || p.includes('commercial')) return 'apartment';
    if (p.includes('life')) return 'favorite';
    if (p.includes('marine') || p.includes('cargo')) return 'local_shipping';
    if (p.includes('health')) return 'health_and_safety';
    if (p.includes('cyber') || p.includes('liability')) return 'security';
    if (p.includes('home') || p.includes('condo')) return 'home';
    return 'policy';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#002c26]/10 text-[#002c26] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#002c26]"></span>
          Active
        </span>
      );
    }
    if (status === 'EXPIRED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dde9ff] text-[#44474d] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#75777e]"></span>
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
        Cancelled
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      {/* Top Action & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
              Home
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Policies</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Policies Management</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {total.toLocaleString()} Records
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Manage, track, and filter active, expired, and cancelled insurance contracts across underwriters.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#eff3ff] hover:bg-[#dde9ff] text-[#0f1c2e] text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#44474d]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] hover:opacity-95 text-[#93f4e3] text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Create Policy</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#44474d] uppercase tracking-wider font-bold">Active Book Volume</span>
            <div className="w-7 h-7 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#17263f]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">3,650</span>
            <span className="text-[11px] text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded-md font-bold">
              +8.4% YOY
            </span>
          </div>
          <div className="mt-2 text-[#44474d] text-[11px]">88.6% active conversion rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#44474d] uppercase tracking-wider font-bold">Gross Written Prem.</span>
            <div className="w-7 h-7 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#17263f]">
              <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">$8.42M</span>
            <span className="text-[11px] text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded-md font-bold">
              +$410k Q3
            </span>
          </div>
          <div className="mt-2 text-[#44474d] text-[11px]">Average premium $2,307/yr</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#44474d] uppercase tracking-wider font-bold">Expiring in 30 Days</span>
            <div className="w-7 h-7 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
              <span className="material-symbols-outlined text-[18px]">notification_important</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">142</span>
            <span className="text-[11px] text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-md font-bold">
              Priority
            </span>
          </div>
          <div className="mt-2 text-[#44474d] text-[11px]">Requires follow-up intervention</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e6eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#44474d] uppercase tracking-wider font-bold">Lapse Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#eff3ff] flex items-center justify-center text-[#17263f]">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#0f1c2e] font-bold tracking-tight tabular-nums">3.64%</span>
            <span className="text-[11px] text-[#002c26] bg-[#e6eeff] px-2 py-0.5 rounded-md font-bold">
              -0.8%
            </span>
          </div>
          <div className="mt-2 text-[#44474d] text-[11px]">Within 4.0% enterprise ceiling</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-[#e6eeff] flex flex-col overflow-hidden">
        {/* Filter Bar with Segmented Tabs & Dropdowns */}
        <div className="p-4 flex flex-col gap-4 border-b border-[#e6eeff]">
          {/* Top Row: Status Tabs & Quick Tools */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Segmented Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#eff3ff] p-1 rounded-lg self-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-white text-[#0f1c2e] shadow-xs'
                    : 'text-[#44474d] hover:text-[#0f1c2e]'
                }`}
              >
                All Policies <span className="ml-1 text-[#75777e] text-[11px] font-normal">(4,120)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ACTIVE');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'ACTIVE'
                    ? 'bg-white text-[#0f1c2e] shadow-xs'
                    : 'text-[#44474d] hover:text-[#0f1c2e]'
                }`}
              >
                ACTIVE <span className="ml-1 text-[#002c26] text-[11px] font-medium">(3,650)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('EXPIRED');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'EXPIRED'
                    ? 'bg-white text-[#0f1c2e] shadow-xs'
                    : 'text-[#44474d] hover:text-[#0f1c2e]'
                }`}
              >
                EXPIRED <span className="ml-1 text-[#75777e] text-[11px] font-medium">(320)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CANCELLED');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'CANCELLED'
                    ? 'bg-white text-[#0f1c2e] shadow-xs'
                    : 'text-[#44474d] hover:text-[#0f1c2e]'
                }`}
              >
                CANCELLED <span className="ml-1 text-[#ba1a1a] text-[11px] font-medium">(150)</span>
              </button>
            </div>

            {/* Fast Tools: Columns & Refresh */}
            <div className="flex items-center gap-2 text-[#44474d] text-xs font-medium">
              <button
                type="button"
                onClick={fetchPolicies}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#eff3ff] hover:bg-[#dde9ff] rounded-lg text-[#0f1c2e] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Control Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* Text Search Box */}
            <div className="md:col-span-5 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#75777e] text-lg">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by policy number, customer name, insurer..."
                className="w-full pl-9 pr-3 py-2 bg-[#eff3ff] rounded-lg text-xs text-[#0f1c2e] placeholder:text-[#75777e] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#002c26] border border-[#d6e3fc] transition-all"
              />
            </div>

            {/* Insurer Dropdown Filter */}
            <div className="md:col-span-3 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#44474d] text-lg">corporate_fare</span>
              <select
                value={selectedInsurer}
                onChange={(e) => {
                  setSelectedInsurer(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-[#eff3ff] rounded-lg text-xs text-[#0f1c2e] focus:outline-none focus:bg-white border border-[#d6e3fc] appearance-none cursor-pointer"
              >
                <option value="">All Insurers (Institutional)</option>
                <option value="Prudential">Prudential Mutual</option>
                <option value="Allianz">Allianz Global</option>
                <option value="Travelers">Travelers Insurance</option>
                <option value="Liberty">Liberty Mutual</option>
                <option value="United">United Underwriters</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-[#44474d] text-[18px]">
                expand_more
              </span>
            </div>

            {/* Date Range Preset */}
            <div className="md:col-span-3 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#44474d] text-lg">calendar_today</span>
              <input
                type="text"
                readOnly
                value="Oct 01, 2023 - Oct 31, 2024"
                className="w-full pl-9 pr-8 py-2 bg-[#eff3ff] rounded-lg text-xs text-[#0f1c2e] border border-[#d6e3fc] cursor-pointer focus:outline-none"
              />
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-[#44474d] text-[18px]">
                date_range
              </span>
            </div>

            {/* Reset Clear Trigger */}
            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                title="Clear all filters"
                className="w-full h-9 flex items-center justify-center bg-[#eff3ff] hover:bg-[#dde9ff] text-[#44474d] hover:text-[#0f1c2e] rounded-lg border border-[#d6e3fc] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              </button>
            </div>
          </div>
        </div>

        {/* Institutional Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 select-none border-b border-[#e6eeff]">
                <th className="pl-4 pr-2 py-2 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={policies.length > 0 && selectedIds.size === policies.length}
                    className="w-4 h-4 rounded text-[#002c26] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2">Policy Number</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Insurer</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2 text-right">Annual Premium</th>
                <th className="px-3 py-2">Start Date</th>
                <th className="px-3 py-2">Expiry Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="pr-4 pl-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff] text-xs text-[#0f1c2e]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#75777e]">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[#002c26]">refresh</span>
                    <p className="mt-2 text-xs">Loading underwritten policy ledger...</p>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#75777e]">
                    <span className="material-symbols-outlined text-4xl text-[#75777e]">search_off</span>
                    <p className="mt-2 text-sm font-semibold text-[#0f1c2e]">No policy records found</p>
                    <p className="text-xs text-[#44474d] mt-1">Try clearing filters or search criteria.</p>
                  </td>
                </tr>
              ) : (
                policies.map((p) => {
                  const daysLeft = getDaysLeft(p.expiryDate);
                  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#eff3ff]/50 transition-colors h-14 group"
                    >
                      {/* Checkbox */}
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded text-[#002c26] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Policy Number */}
                      <td className="px-3 py-3 font-mono font-bold text-[#17263f]">
                        <div className="flex items-center gap-1.5">
                          <span>{p.policyNumber}</span>
                          <span className="material-symbols-outlined text-[14px] text-[#75777e] opacity-0 group-hover:opacity-100 transition-opacity">
                            open_in_new
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#cadeff] text-[#061c35] flex items-center justify-center text-[11px] font-bold">
                            {getInitials(p.customerName || 'Cust')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-[#0f1c2e] leading-tight truncate">
                              {p.customerName || 'Institutional Client'}
                            </span>
                            <span className="text-[10px] text-[#75777e] font-mono">
                              {p.customerNumber || 'CUST-88120'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Insurer */}
                      <td className="px-3 py-3 text-[#0f1c2e] font-medium">{p.insurer}</td>

                      {/* Product */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[#0f1c2e]">
                          <span className="material-symbols-outlined text-[16px] text-[#75777e]">
                            {getProductIcon(p.product)}
                          </span>
                          <span>{p.product}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3">
                        <span className="bg-[#eff3ff] border border-[#d6e3fc] px-2 py-0.5 rounded text-[11px] text-[#44474d] font-medium">
                          {p.policyType}
                        </span>
                      </td>

                      {/* Annual Premium */}
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#0f1c2e] tabular-nums">
                        {formatCurrency(p.premium)}{' '}
                        <span className="text-[10px] text-[#75777e] font-normal">/ yr</span>
                      </td>

                      {/* Start Date */}
                      <td className="px-3 py-3 text-[#44474d]">{formatDate(p.startDate)}</td>

                      {/* Expiry Date */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[#0f1c2e]">
                          <span>{formatDate(p.expiryDate)}</span>
                          {isExpiringSoon && p.status === 'ACTIVE' && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded text-[10px] font-bold"
                              title="Expiring within 30 days"
                            >
                              {daysLeft}d Left
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">{getStatusBadge(p.status)}</td>

                      {/* Actions */}
                      <td className="pr-4 pl-3 py-3 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdownId(openDropdownId === p.id ? null : p.id)
                            }
                            className="p-1.5 rounded-md hover:bg-[#eff3ff] text-[#44474d] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>

                          {openDropdownId === p.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#e6eeff] z-30 py-1 text-left text-xs font-medium text-[#0f1c2e] animate-in fade-in duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onNavigate(`/branch/customers`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#eff3ff] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#4d5f7b]">visibility</span>
                                <span>View Policy Details</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onNavigate('/branch/renewals');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#eff3ff] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#002c26]">autorenew</span>
                                <span>Initiate Renewal</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  setSelectedPolicyForClaim(p);
                                  setClaimModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#eff3ff] transition-colors text-[#ba1a1a]"
                              >
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                <span>Report Claim</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onNavigate('/branch/documents');
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#eff3ff] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#75777e]">download</span>
                                <span>Download Docs</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="p-4 bg-white border-t border-[#e6eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[#44474d] text-xs">
            <span>
              Showing <strong className="font-semibold text-[#0f1c2e]">{(page - 1) * limit + 1}</strong> to{' '}
              <strong className="font-semibold text-[#0f1c2e]">
                {Math.min(page * limit, total)}
              </strong>{' '}
              of <strong className="font-semibold text-[#0f1c2e]">{total.toLocaleString()}</strong> policies
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[#44474d] text-xs">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#eff3ff] text-[#0f1c2e] text-xs font-semibold rounded px-2 py-1 border border-[#d6e3fc] outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>

          {/* 1-Based Server Pagination Navigation */}
          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eff3ff] text-[#44474d] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#dde9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={() => setPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                page === 1
                  ? 'bg-[#002c26] text-[#93f4e3] shadow-xs'
                  : 'bg-[#eff3ff] text-[#0f1c2e] hover:bg-[#dde9ff]'
              }`}
            >
              1
            </button>

            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage(2)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  page === 2
                    ? 'bg-[#002c26] text-[#93f4e3] shadow-xs'
                    : 'bg-[#eff3ff] text-[#0f1c2e] hover:bg-[#dde9ff]'
                }`}
              >
                2
              </button>
            )}

            {totalPages > 2 && (
              <button
                type="button"
                onClick={() => setPage(3)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  page === 3
                    ? 'bg-[#002c26] text-[#93f4e3] shadow-xs'
                    : 'bg-[#eff3ff] text-[#0f1c2e] hover:bg-[#dde9ff]'
                }`}
              >
                3
              </button>
            )}

            {totalPages > 4 && (
              <span className="w-8 h-8 flex items-center justify-center text-xs text-[#75777e]">...</span>
            )}

            {totalPages > 3 && (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  page === totalPages
                    ? 'bg-[#002c26] text-[#93f4e3] shadow-xs'
                    : 'bg-[#eff3ff] text-[#0f1c2e] hover:bg-[#dde9ff]'
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#eff3ff] hover:bg-[#dde9ff] text-[#0f1c2e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Realtime API / Ledger Sync Indicator Bar */}
        <div className="px-4 py-2 bg-[#eff3ff] border-t border-[#e6eeff] flex items-center justify-between text-[11px] text-[#44474d]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#002c26] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#0f1c2e]">
              Connected to /api/policies (page={page}, limit={limit})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Latency: {latency}ms</span>
            <span>Synced: {syncTime}</span>
          </div>
        </div>
      </div>

      {/* Policy Creation Modal */}
      <CreatePolicyDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchPolicies}
      />

      {/* Claim Modal for Policy Row */}
      <CreateClaimDialog
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onCreated={() => onNavigate('/branch/claims')}
      />
    </div>
  );
};
