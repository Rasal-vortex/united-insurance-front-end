import { useState, useEffect } from "react";
import { claimService } from "@/services/claim-service";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { ClaimDetailModal } from "@/components/dialogs/claim-detail-modal";
import { CreateClaimDialog } from "@/components/dialogs/create-claim-dialog";

export const ClaimsPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [activeClaim, setActiveClaim] = useState(null);
  const [claimModalMode, setClaimModalMode] = useState("view");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [createClaimModalOpen, setCreateClaimModalOpen] = useState(false);

  const fetchClaims = () => {
    setLoading(true);
    setError("");
    claimService
      .getClaims({
        page,
        limit,
        search: searchTerm.trim() || undefined,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      })
      .then((res) => {
        if (!Array.isArray(res?.data)) throw new Error("The claims response did not contain a data array.");
        setClaims(res.data);
        const responseTotal = Number(res?.meta?.total ?? res?.pagination?.total ?? res.data.length);
        setTotal(responseTotal);
        setTotalPages(
          Number(res?.meta?.totalPages ?? res?.pagination?.totalPages ?? Math.max(1, Math.ceil(responseTotal / limit)))
        );
      })
      .catch((err) => setError(err?.message || "Failed to load claims."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, [page, selectedStatus, searchTerm]);

  const handleOpenDetail = async (claim, mode = "view") => {
    setClaimModalMode(mode);
    setActiveClaim({ ...claim, loading: true });
    setDetailModalOpen(true);
    try {
      const response = await claimService.getClaimById(claim.id);
      setActiveClaim(response?.data ?? response);
    } catch (err) {
      setActiveClaim({ ...claim, error: err?.message || "Could not load claim details." });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#7054a5] text-[#ffffff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
            APPROVED
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#cadeff] text-[#061c35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6e6a75]" />
            UNDER_REVIEW
          </span>
        );
      case "REPORTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#ebe5f4] text-[#061c35]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6e6a75]" />
            REPORTED
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#ffdad6] text-[#ba1a1a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
            REJECTED
          </span>
        );
      case "SETTLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#f7f6f8] text-[#716d78]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#827e89]" />
            SETTLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-[#f7f6f8] px-2.5 py-1 text-[11px] font-bold uppercase text-[#716d78]">
            {status || "—"}
          </span>
        );
    }
  };

  const pendingClaims = claims.filter((claim) => ["REPORTED", "UNDER_REVIEW"].includes(claim.status));
  const approvedClaims = claims.filter((claim) => claim.status === "APPROVED");
  const settledClaims = claims.filter((claim) => claim.status === "SETTLED");
  const amountTotal = (rows) =>
    rows.some((claim) => claim.amount != null)
      ? formatCurrency(rows.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0))
      : "—";

  const getPolicyTypeIcon = (prod) => {
    const p = (prod || "").toLowerCase();
    if (p.includes("auto")) return "directions_car";
    if (p.includes("home") || p.includes("hazard")) return "home";
    if (p.includes("marine") || p.includes("vessel")) return "directions_boat";
    if (p.includes("fleet") || p.includes("truck")) return "local_shipping";
    if (p.includes("equipment") || p.includes("commercial")) return "domain";
    return "cottage";
  };

  const handleExportClaims = () => {
    const headers = ["Claim Number", "Customer", "Policy Number", "Product", "Claim Date", "Amount", "Status"];
    const rows = claims.map((c) => [
      c.claimNumber,
      c.customerName || "",
      c.policyNumber || "",
      c.policyProduct || "",
      c.claimDate,
      c.amount,
      c.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claims_queue_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 lg:px-8 py-6 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[#716d78] text-xs font-semibold">
            <span className="hover:text-[#302d36] cursor-pointer" onClick={() => onNavigate("/branch/dashboard")}>
              Home
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#302d36] font-bold">Claims</span>
          </div>
          <h1 className="text-3xl font-bold text-[#302d36] tracking-tight">Claims</h1>
          <p className="text-sm text-[#716d78] max-w-2xl">
            Review claim details and keep claim statuses up to date.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportClaims}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#f0eef3] shadow-xs hover:bg-[#f7f6f8] text-[#302d36] text-xs font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#716d78]">ios_share</span>
            <span>Export Claims</span>
          </button>
          {isBranch && (
            <button
              type="button"
              onClick={() => setCreateClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7054a5] text-[#ffffff] hover:opacity-95 shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ File New Claim</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-[#f0eef3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#cadeff] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#716d78]">Pending Review</span>
            </div>
            <span className="material-symbols-outlined text-[#6e6a75] text-xl">pending_actions</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#302d36] font-bold tabular-nums">{pendingClaims.length}</span>
              <span className="text-sm text-[#716d78] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#6e6a75] font-bold">{amountTotal(pendingClaims)}</span>
              <span className="text-xs text-[#827e89]">Amount on this page</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#f0eef3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7054a5]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#716d78]">Approved claims</span>
            </div>
            <span className="material-symbols-outlined text-[#7054a5] text-xl">account_balance</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#302d36] font-bold tabular-nums">{approvedClaims.length}</span>
              <span className="text-sm text-[#716d78] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#7054a5] font-bold">{amountTotal(approvedClaims)}</span>
              <span className="text-xs text-[#827e89]">Amount on this page</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#f0eef3] shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4f627e]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#716d78]">Settled claims</span>
            </div>
            <span className="material-symbols-outlined text-[#292631] text-xl">fact_check</span>
          </div>
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-[#302d36] font-bold tabular-nums">{settledClaims.length}</span>
              <span className="text-sm text-[#716d78] font-medium">Claims</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base text-[#302d36] font-bold">{amountTotal(settledClaims)}</span>
              <span className="text-xs text-[#827e89]">Amount on this page</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 bg-white border border-[#f0eef3] rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#827e89] text-lg">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                }
              }}
              placeholder="Search claims"
              className="w-full pl-9 pr-4 py-2 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-xs text-[#302d36] placeholder:text-[#827e89] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#7054a5]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value=""
                disabled
                className="appearance-none bg-[#f7f6f8] border border-[#e7e4eb] pl-3 pr-8 py-2 rounded-lg text-xs font-semibold text-[#302d36] focus:outline-none cursor-pointer"
              >
                <option value="">Policy type filter unavailable</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-[#716d78] text-base pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="flex items-center bg-[#f7f6f8] border border-[#e7e4eb] px-3 py-2 rounded-lg gap-2 cursor-default text-[#302d36]">
              <span className="material-symbols-outlined text-sm text-[#716d78]">calendar_today</span>
              <span className="text-xs font-medium">Date filter unavailable</span>
              <span className="material-symbols-outlined text-xs text-[#716d78]">arrow_drop_down</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("ALL");
                setPage(1);
              }}
              className="p-2 text-[#716d78] hover:text-[#302d36] rounded-lg hover:bg-[#f7f6f8] border border-[#e7e4eb] transition-colors"
              title="Clear Filters"
            >
              <span className="material-symbols-outlined text-base">filter_alt_off</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-2 border-t border-[#f0eef3]">
          <span className="text-[11px] text-[#716d78] font-bold uppercase mr-2 shrink-0">Filter Status:</span>
          {["ALL", "OPEN", "REPORTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                selectedStatus === st
                  ? "bg-[#292631] text-white shadow-xs"
                  : "bg-[#f7f6f8] text-[#716d78] hover:bg-[#ebe5f4]"
              }`}
            >
              {st} {selectedStatus === "ALL" && st === "ALL" ? `(${total})` : ""}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xs border border-[#f0eef3] overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#f0eef3]">
                <th className="px-5 py-2">Claim Number</th>
                <th className="px-5 py-2">Customer</th>
                <th className="px-5 py-2">Related Policy</th>
                <th className="px-5 py-2">Claim Date</th>
                <th className="px-5 py-2 text-right">Claim Amount</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3] text-xs text-[#302d36]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#827e89]">
                    <span className="material-symbols-outlined text-3xl animate-spin text-[#7054a5]">refresh</span>
                    <p className="mt-2 text-xs">Loading queue adjudication records...</p>
                  </td>
                </tr>
              ) : claims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#827e89]">
                    <span className="material-symbols-outlined text-4xl text-[#827e89]">fact_check</span>
                    <p className="mt-2 text-sm font-semibold text-[#302d36]">No claims matching filters</p>
                  </td>
                </tr>
              ) : (
                claims.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#f7f6f8]/50 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(c)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#7054a5] text-base">
                          {getPolicyTypeIcon(c.policyProduct)}
                        </span>
                        <span className="font-mono font-bold text-[#302d36] group-hover:text-[#7054a5] transition-colors">
                          {c.claimNumber || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#cadeff] flex items-center justify-center text-[#061c35] text-xs font-bold">
                          {c.customerName ? getInitials(c.customerName) : "—"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#302d36] leading-tight truncate">
                            {c.customerName || "—"}
                          </span>
                          <span className="text-[11px] text-[#827e89]">{c.customerPhone || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-[#302d36]">{c.policyNumber || "—"}</span>
                        <span className="text-[11px] text-[#716d78] truncate">{c.policyProduct || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#716d78]">{formatDate(c.claimDate)}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-[#302d36] text-sm tabular-nums">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-center">{getStatusBadge(c.status)}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c)}
                          title="View Claim Details"
                          className="p-1 rounded-md hover:bg-[#f7f6f8] text-[#716d78] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenActionId(openActionId === c.id ? null : c.id)}
                            title="Claim actions"
                            aria-label="Claim actions"
                            aria-expanded={openActionId === c.id}
                            className="p-1 rounded-md hover:bg-[#f7f6f8] text-[#716d78] transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                          {openActionId === c.id && (
                            <div className="absolute right-0 top-full z-30 mt-1 min-w-44 rounded-lg border border-[#f0eef3] bg-white py-1 text-left shadow-xl">
                              {isBranch && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionId(null);
                                    handleOpenDetail(c, "edit");
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#302d36] hover:bg-[#f7f6f8]"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                  Edit claim status
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null);
                                  handleOpenDetail(c);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#302d36] hover:bg-[#f7f6f8]"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                                View details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-[#f7f6f8]/70 border-t border-[#f0eef3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#716d78]">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-[#302d36] font-bold">{claims.length}</strong> of{" "}
              <strong className="text-[#302d36] font-bold">{total}</strong> claims
            </span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-[#e7e4eb]" />
          </div>
          <div className="flex items-center gap-1 select-none">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-md bg-white border border-[#e7e4eb] text-[#716d78] hover:bg-[#f7f6f8] font-semibold text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span> Prev
            </button>
            <button
              type="button"
              onClick={() => setPage(1)}
              className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                page === 1 ? "bg-[#292631] text-white shadow-xs" : "bg-white border border-[#e7e4eb] text-[#302d36]"
              }`}
            >
              1
            </button>
            {totalPages >= 2 && (
              <button
                type="button"
                onClick={() => setPage(2)}
                className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                  page === 2 ? "bg-[#292631] text-white shadow-xs" : "bg-white border border-[#e7e4eb] text-[#302d36]"
                }`}
              >
                2
              </button>
            )}
            {totalPages >= 3 && (
              <button
                type="button"
                onClick={() => setPage(3)}
                className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                  page === 3 ? "bg-[#292631] text-white shadow-xs" : "bg-white border border-[#e7e4eb] text-[#302d36]"
                }`}
              >
                3
              </button>
            )}
            {totalPages >= 4 && (
              <button
                type="button"
                onClick={() => setPage(4)}
                className={`w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center ${
                  page === 4 ? "bg-[#292631] text-white shadow-xs" : "bg-white border border-[#e7e4eb] text-[#302d36]"
                }`}
              >
                4
              </button>
            )}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-md bg-white border border-[#e7e4eb] text-[#302d36] hover:bg-[#f7f6f8] font-semibold text-xs flex items-center gap-1 disabled:opacity-40"
            >
              Next <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <ClaimDetailModal
        claim={activeClaim}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onUpdated={fetchClaims}
        mode={claimModalMode}
        user={user}
      />
      {isBranch && (
        <CreateClaimDialog
          isOpen={createClaimModalOpen}
          onClose={() => setCreateClaimModalOpen(false)}
          onCreated={fetchClaims}
        />
      )}
    </div>
  );
};
