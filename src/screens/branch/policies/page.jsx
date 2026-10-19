import { useState, useEffect } from "react";
import { policyService } from "@/services/policy-service";
import { formatCurrency, formatDate, getDaysLeft } from "@/lib/utils";
import { CreatePolicyDialog } from "@/components/dialogs/create-policy-dialog";
import { CreateClaimDialog } from "@/components/dialogs/create-claim-dialog";

export const PoliciesPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInsurer, setSelectedInsurer] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editForm, setEditForm] = useState({
    policyNumber: "",
    insurer: "",
    product: "",
    policyType: "",
    premium: "",
    startDate: "",
    expiryDate: "",
    status: "",
  });
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState("");

  const fetchPolicies = () => {
    setLoading(true);
    setError("");
    const params = {
      page,
      limit,
      search: searchTerm,
      status: activeTab === "ALL" ? undefined : activeTab,
    };
    policyService
      .getPolicies(params)
      .then((res) => {
        if (!Array.isArray(res?.data)) throw new Error("The policies response did not contain a data array.");
        setPolicies(res.data);
        const responseTotal = Number(res?.meta?.total ?? res?.pagination?.total ?? res.data.length);
        setTotal(responseTotal);
        setTotalPages(
          Number(res?.meta?.totalPages ?? res?.pagination?.totalPages ?? Math.max(1, Math.ceil(responseTotal / limit)))
        );
      })
      .catch((err) => setError(err?.message || "Failed to load policies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicies();
  }, [page, limit, activeTab, searchTerm]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      setPage(1);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedInsurer("");
    setActiveTab("ALL");
    setPage(1);
  };

  const visiblePolicies = selectedInsurer ? policies.filter((policy) => policy.insurer === selectedInsurer) : policies;
  const insurerOptions = [...new Set(policies.map((policy) => policy.insurer).filter(Boolean))];
  const activePolicyCount = policies.filter((policy) => policy.status === "ACTIVE").length;
  const visiblePremium = policies.reduce((sum, policy) => sum + (Number(policy.premium) || 0), 0);
  const expiringSoonCount = policies.filter((policy) => {
    const days = getDaysLeft(policy.expiryDate);
    return policy.status === "ACTIVE" && days !== null && days > 0 && days <= 30;
  }).length;

  const openPolicy = async (policy) => {
    setSelectedPolicy({ ...policy, loading: true });
    try {
      const response = await policyService.getPolicyById(policy.id);
      setSelectedPolicy(response?.data ?? response);
    } catch (err) {
      setSelectedPolicy({ ...policy, error: err?.message || "Could not load policy details." });
    }
  };

  const openPolicyEdit = async (policy) => {
    setEditingPolicy(policy);
    setEditError("");
    try {
      const response = await policyService.getPolicyById(policy.id);
      const detail = response?.data ?? response;
      setEditForm({
        policyNumber: detail.policyNumber ?? "",
        insurer: detail.insurer ?? "",
        product: detail.product ?? "",
        policyType: detail.policyType ?? "",
        premium: detail.premium ?? "",
        startDate: detail.startDate ? String(detail.startDate).slice(0, 10) : "",
        expiryDate: detail.expiryDate ? String(detail.expiryDate).slice(0, 10) : "",
        status: detail.status ?? "ACTIVE",
      });
    } catch (err) {
      setEditError(err?.message || "Could not load policy details.");
    }
  };

  const savePolicyEdit = async (event) => {
    event.preventDefault();
    if (!editingPolicy?.id) return;
    setSavingEdit(true);
    setEditError("");
    try {
      if (
        !editForm.policyNumber ||
        !editForm.insurer ||
        !editForm.product ||
        !editForm.policyType ||
        !editForm.premium ||
        !editForm.startDate ||
        !editForm.expiryDate
      ) {
        throw new Error("Complete all required policy fields before saving.");
      }
      const payload = {
        ...editForm,
        premium: Number(editForm.premium),
        startDate: new Date(editForm.startDate).toISOString(),
        expiryDate: new Date(editForm.expiryDate).toISOString(),
      };
      const response = await policyService.updatePolicy(editingPolicy.id, payload);
      if (response?.success === false) throw new Error(response.message || "Policy update failed.");
      setEditingPolicy(null);
      fetchPolicies();
    } catch (err) {
      setEditError(err?.message || "Could not update policy.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(policies.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    const headers = [
      "Policy Number",
      "Customer",
      "Insurer",
      "Product",
      "Type",
      "Premium",
      "Start Date",
      "Expiry Date",
      "Status",
    ];
    const rows = policies.map((p) => [
      p.policyNumber,
      p.customerId ? "Linked customer" : "",
      p.insurer,
      p.product,
      p.policyType,
      p.premium,
      p.startDate,
      p.expiryDate,
      p.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `policies_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProductIcon = (product) => {
    const p = product.toLowerCase();
    if (p.includes("auto") || p.includes("motor")) return "directions_car";
    if (p.includes("property") || p.includes("commercial")) return "apartment";
    if (p.includes("life")) return "favorite";
    if (p.includes("marine") || p.includes("cargo")) return "local_shipping";
    if (p.includes("health")) return "health_and_safety";
    if (p.includes("cyber") || p.includes("liability")) return "security";
    if (p.includes("home") || p.includes("condo")) return "home";
    return "policy";
  };

  const getStatusBadge = (status) => {
    if (status === "ACTIVE") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7054a5]/10 text-[#7054a5] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7054a5]" />
          Active
        </span>
      );
    }
    if (status === "EXPIRED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ebe5f4] text-[#716d78] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#827e89]" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
        Cancelled
      </span>
    );
  };

  const editFields = [
    ["policyNumber", "Policy Number", "text"],
    ["insurer", "Insurer", "text"],
    ["product", "Product", "text"],
    ["policyType", "Policy Type", "text"],
    ["premium", "Premium", "number"],
    ["startDate", "Start Date", "date"],
    ["expiryDate", "Expiry Date", "date"],
  ];

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#302d36] cursor-pointer" onClick={() => onNavigate("/branch/dashboard")}>
              Home
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Policies</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#302d36] tracking-tight">Policies Management</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {total.toLocaleString()} Records
            </span>
          </div>
          <p className="text-xs text-[#716d78]">
            Manage, track, and filter active, expired, and cancelled insurance contracts across underwriters.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#f7f6f8] hover:bg-[#ebe5f4] text-[#302d36] text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#716d78]">file_download</span>
            <span>Export CSV</span>
          </button>
          {isBranch && (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7054a5] hover:opacity-95 text-[#ffffff] text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Create Policy</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#f0eef3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#716d78] uppercase tracking-wider font-bold">Active Book Volume</span>
            <div className="w-7 h-7 rounded-lg bg-[#f7f6f8] flex items-center justify-center text-[#292631]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#302d36] font-bold tracking-tight tabular-nums">{activePolicyCount}</span>
            <span className="text-[11px] text-[#7054a5] bg-[#f0eef3] px-2 py-0.5 rounded-md font-bold">On this page</span>
          </div>
          <div className="mt-2 text-[#716d78] text-[11px]">Active policies in current results</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#f0eef3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#716d78] uppercase tracking-wider font-bold">Gross Written Prem.</span>
            <div className="w-7 h-7 rounded-lg bg-[#f7f6f8] flex items-center justify-center text-[#292631]">
              <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#302d36] font-bold tracking-tight tabular-nums">
              {formatCurrency(visiblePremium)}
            </span>
            <span className="text-[11px] text-[#7054a5] bg-[#f0eef3] px-2 py-0.5 rounded-md font-bold">On this page</span>
          </div>
          <div className="mt-2 text-[#716d78] text-[11px]">Premium total in current results</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#f0eef3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#716d78] uppercase tracking-wider font-bold">Expiring in 30 Days</span>
            <div className="w-7 h-7 rounded-lg bg-[#ffdad6] flex items-center justify-center text-[#93000a]">
              <span className="material-symbols-outlined text-[18px]">notification_important</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#302d36] font-bold tracking-tight tabular-nums">{expiringSoonCount}</span>
            <span className="text-[11px] text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded-md font-bold">On this page</span>
          </div>
          <div className="mt-2 text-[#716d78] text-[11px]">Active policies expiring within 30 days</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#f0eef3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#716d78] uppercase tracking-wider font-bold">Lapse Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[#f7f6f8] flex items-center justify-center text-[#292631]">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl text-[#302d36] font-bold tracking-tight tabular-nums">—</span>
            <span className="text-[11px] text-[#7054a5] bg-[#f0eef3] px-2 py-0.5 rounded-md font-bold">Not returned</span>
          </div>
          <div className="mt-2 text-[#716d78] text-[11px]">Lapse rate is not provided by the policies API</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-[#f0eef3] flex flex-col overflow-hidden">
        <div className="p-4 flex flex-col gap-4 border-b border-[#f0eef3]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-[#f7f6f8] p-1 rounded-lg self-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ALL");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "ALL" ? "bg-white text-[#302d36] shadow-xs" : "text-[#716d78] hover:text-[#302d36]"
                }`}
              >
                All Policies{" "}
                <span className="ml-1 text-[#827e89] text-[11px] font-normal">
                  ({activeTab === "ALL" ? total : policies.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("ACTIVE");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "ACTIVE" ? "bg-white text-[#302d36] shadow-xs" : "text-[#716d78] hover:text-[#302d36]"
                }`}
              >
                ACTIVE{" "}
                <span className="ml-1 text-[#7054a5] text-[11px] font-medium">
                  {activeTab === "ACTIVE" ? total : policies.filter((p) => p.status === "ACTIVE").length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("EXPIRED");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "EXPIRED" ? "bg-white text-[#302d36] shadow-xs" : "text-[#716d78] hover:text-[#302d36]"
                }`}
              >
                EXPIRED{" "}
                <span className="ml-1 text-[#827e89] text-[11px] font-medium">
                  {activeTab === "EXPIRED" ? total : policies.filter((p) => p.status === "EXPIRED").length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("CANCELLED");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "CANCELLED" ? "bg-white text-[#302d36] shadow-xs" : "text-[#716d78] hover:text-[#302d36]"
                }`}
              >
                CANCELLED{" "}
                <span className="ml-1 text-[#ba1a1a] text-[11px] font-medium">
                  {activeTab === "CANCELLED" ? total : policies.filter((p) => p.status === "CANCELLED").length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#716d78] text-xs font-medium">
              <button
                type="button"
                onClick={fetchPolicies}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#f7f6f8] hover:bg-[#ebe5f4] rounded-lg text-[#302d36] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-5 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#827e89] text-lg">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by policy number, customer name, insurer..."
                className="w-full pl-9 pr-3 py-2 bg-[#f7f6f8] rounded-lg text-xs text-[#302d36] placeholder:text-[#827e89] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7054a5] border border-[#e7e4eb] transition-all"
              />
            </div>

            <div className="md:col-span-3 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#716d78] text-lg">corporate_fare</span>
              <select
                value={selectedInsurer}
                onChange={(e) => {
                  setSelectedInsurer(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-[#f7f6f8] rounded-lg text-xs text-[#302d36] focus:outline-none focus:bg-white border border-[#e7e4eb] appearance-none cursor-pointer"
              >
                <option value="">All Insurers (Institutional)</option>
                {insurerOptions.map((insurer) => (
                  <option key={insurer} value={insurer}>
                    {insurer}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-[#716d78] text-[18px]">
                expand_more
              </span>
            </div>

            <div className="md:col-span-3 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#716d78] text-lg">calendar_today</span>
              <input
                type="text"
                readOnly
                value="Date range not provided by API"
                className="w-full pl-9 pr-8 py-2 bg-[#f7f6f8] rounded-lg text-xs text-[#302d36] border border-[#e7e4eb] cursor-pointer focus:outline-none"
              />
              <span className="material-symbols-outlined absolute right-2.5 pointer-events-none text-[#716d78] text-[18px]">
                date_range
              </span>
            </div>

            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                title="Clear all filters"
                className="w-full h-9 flex items-center justify-center bg-[#f7f6f8] hover:bg-[#ebe5f4] text-[#716d78] hover:text-[#302d36] rounded-lg border border-[#e7e4eb] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mx-4 mt-3 rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">
            {error}
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 select-none border-b border-[#f0eef3]">
                <th className="pl-4 pr-2 py-2 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={policies.length > 0 && selectedIds.size === policies.length}
                    className="w-4 h-4 rounded text-[#7054a5] focus:ring-0 cursor-pointer"
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
            <tbody className="divide-y divide-[#f0eef3] text-xs text-[#302d36]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#827e89]">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[#7054a5]">refresh</span>
                    <p className="mt-2 text-xs">Loading underwritten policy ledger...</p>
                  </td>
                </tr>
              ) : visiblePolicies.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#827e89]">
                    <span className="material-symbols-outlined text-4xl text-[#827e89]">search_off</span>
                    <p className="mt-2 text-sm font-semibold text-[#302d36]">No policy records found</p>
                    <p className="text-xs text-[#716d78] mt-1">Try clearing filters or search criteria.</p>
                  </td>
                </tr>
              ) : (
                visiblePolicies.map((p) => {
                  const daysLeft = getDaysLeft(p.expiryDate);
                  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

                  return (
                    <tr key={p.id} className="hover:bg-[#f7f6f8]/50 transition-colors h-14 group">
                      <td className="pl-4 pr-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => handleToggleSelect(p.id)}
                          className="w-4 h-4 rounded text-[#7054a5] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3 font-mono font-bold text-[#292631]">
                        <div className="flex items-center gap-1.5">
                          <span>{p.policyNumber}</span>
                          <span className="material-symbols-outlined text-[14px] text-[#827e89] opacity-0 group-hover:opacity-100 transition-opacity">
                            open_in_new
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#cadeff] text-[#061c35] flex items-center justify-center text-[11px] font-bold">{p.customerId ? "✓" : "—"}</div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-semibold text-[#302d36] leading-tight truncate">
                              {p.customerId ? "Linked customer" : "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#302d36] font-medium">{p.insurer}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[#302d36]">
                          <span className="material-symbols-outlined text-[16px] text-[#827e89]">
                            {getProductIcon(p.product)}
                          </span>
                          <span>{p.product}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="bg-[#f7f6f8] border border-[#e7e4eb] px-2 py-0.5 rounded text-[11px] text-[#716d78] font-medium">
                          {p.policyType}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-[#302d36] tabular-nums">
                        {formatCurrency(p.premium)}{" "}
                        <span className="text-[10px] text-[#827e89] font-normal">/ yr</span>
                      </td>
                      <td className="px-3 py-3 text-[#716d78]">{formatDate(p.startDate)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5 text-[#302d36]">
                          <span>{formatDate(p.expiryDate)}</span>
                          {isExpiringSoon && p.status === "ACTIVE" && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 bg-[#ffdad6] text-[#ba1a1a] rounded text-[10px] font-bold"
                              title="Expiring within 30 days"
                            >
                              {daysLeft}d Left
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">{getStatusBadge(p.status)}</td>
                      <td className="pr-4 pl-3 py-3 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                            className="p-1.5 rounded-md hover:bg-[#f7f6f8] text-[#716d78] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                          {openDropdownId === p.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#f0eef3] z-30 py-1 text-left text-xs font-medium text-[#302d36] animate-in fade-in duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  openPolicy(p);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f7f6f8] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#6e6a75]">visibility</span>
                                <span>View Policy Details</span>
                              </button>
                              {isBranch && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    openPolicyEdit(p);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f7f6f8] transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[16px] text-[#6e6a75]">edit</span>
                                  <span>Edit Policy</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onNavigate("/branch/renewals");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f7f6f8] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#7054a5]">autorenew</span>
                                <span>Initiate Renewal</span>
                              </button>
                              {isBranch && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setSelectedPolicyForClaim(p);
                                    setClaimModalOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f7f6f8] transition-colors text-[#ba1a1a]"
                                >
                                  <span className="material-symbols-outlined text-[16px]">warning</span>
                                  <span>Report Claim</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  onNavigate("/branch/documents");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f7f6f8] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-[#827e89]">download</span>
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

        <div className="p-4 bg-white border-t border-[#f0eef3] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[#716d78] text-xs">
            <span>
              Showing <strong className="font-semibold text-[#302d36]">{(page - 1) * limit + 1}</strong> to{" "}
              <strong className="font-semibold text-[#302d36]">{Math.min(page * limit, total)}</strong> of{" "}
              <strong className="font-semibold text-[#302d36]">{total.toLocaleString()}</strong> policies
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#716d78] text-xs">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#f7f6f8] text-[#302d36] text-xs font-semibold rounded px-2 py-1 border border-[#e7e4eb] outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f7f6f8] text-[#716d78] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ebe5f4] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={() => setPage(1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                page === 1 ? "bg-[#7054a5] text-[#ffffff] shadow-xs" : "bg-[#f7f6f8] text-[#302d36] hover:bg-[#ebe5f4]"
              }`}
            >
              1
            </button>
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setPage(2)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  page === 2 ? "bg-[#7054a5] text-[#ffffff] shadow-xs" : "bg-[#f7f6f8] text-[#302d36] hover:bg-[#ebe5f4]"
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
                  page === 3 ? "bg-[#7054a5] text-[#ffffff] shadow-xs" : "bg-[#f7f6f8] text-[#302d36] hover:bg-[#ebe5f4]"
                }`}
              >
                3
              </button>
            )}
            {totalPages > 4 && (
              <span className="w-8 h-8 flex items-center justify-center text-xs text-[#827e89]">...</span>
            )}
            {totalPages > 3 && (
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                  page === totalPages
                    ? "bg-[#7054a5] text-[#ffffff] shadow-xs"
                    : "bg-[#f7f6f8] text-[#302d36] hover:bg-[#ebe5f4]"
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#f7f6f8] hover:bg-[#ebe5f4] text-[#302d36] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {error && <div role="alert" className="border-t border-[#f0eef3] px-4 py-2 text-xs text-[#93000a]">{error}</div>}
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Policy details</h2>
              <button type="button" onClick={() => setSelectedPolicy(null)}>
                Close
              </button>
            </div>
            {selectedPolicy.loading ? (
              <p>Loading policy details…</p>
            ) : selectedPolicy.error ? (
              <p role="alert" className="text-sm text-[#ba1a1a]">
                {selectedPolicy.error}
              </p>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Policy Number", selectedPolicy.policyNumber],
                  ["Customer", selectedPolicy.customerId ? "Linked customer" : null],
                  ["Insurer", selectedPolicy.insurer],
                  ["Product", selectedPolicy.product],
                  ["Policy Type", selectedPolicy.policyType],
                  ["Premium", selectedPolicy.premium],
                  ["Start Date", selectedPolicy.startDate],
                  ["Expiry Date", selectedPolicy.expiryDate],
                  ["Status", selectedPolicy.status],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-[#827e89]">{label}</dt>
                    <dd className="font-medium">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      )}

      {editingPolicy && isBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 p-4">
          <form onSubmit={savePolicyEdit} className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit policy</h2>
              <button type="button" onClick={() => setEditingPolicy(null)}>
                Close
              </button>
            </div>
            {editError && (
              <p role="alert" className="mb-3 text-sm text-[#ba1a1a]">
                {editError}
              </p>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {editFields.map(([name, label, type]) => (
                <label key={name} className="flex flex-col gap-1 text-xs font-semibold">
                  {label}
                  <input
                    type={type}
                    min={type === "number" ? "0" : undefined}
                    step={type === "number" ? "0.01" : undefined}
                    required
                    value={editForm[name]}
                    onChange={(event) => setEditForm({ ...editForm, [name]: event.target.value })}
                    className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal"
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1 text-xs font-semibold">
                Status
                <select
                  value={editForm.status}
                  onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}
                  className="rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPolicy(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="rounded-lg bg-[#7054a5] px-4 py-2 text-sm font-bold text-[#ffffff] disabled:opacity-50"
              >
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isBranch && (
        <CreatePolicyDialog
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={fetchPolicies}
        />
      )}

      {isBranch && (
        <CreateClaimDialog
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onCreated={() => onNavigate("/branch/claims")}
        />
      )}
    </div>
  );
};
