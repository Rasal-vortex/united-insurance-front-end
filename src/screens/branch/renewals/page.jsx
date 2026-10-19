import { useCallback, useEffect, useState } from "react";
import { renewalService } from "@/services/renewal-service";
import { formatDate } from "@/lib/utils";

const getRows = (response) => Array.isArray(response?.data) ? response.data : [];

export const RenewalsPage = ({ onNavigate }) => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeRenewal, setActiveRenewal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 10;

  const fetchRenewals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await renewalService.getRenewals({ page, limit });
      if (!Array.isArray(response?.data)) throw new Error("The renewals response did not contain a data array.");
      setRenewals(getRows(response));
      const responseTotal = Number(response?.meta?.total ?? response?.pagination?.total ?? response.data.length);
      setTotal(responseTotal);
      setTotalPages(Number(response?.meta?.totalPages ?? response?.pagination?.totalPages ?? Math.max(1, Math.ceil(responseTotal / limit))));
    } catch (err) {
      setError(err?.message || "Could not load renewals.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchRenewals(); }, [fetchRenewals]);

  const openDetails = async (renewal) => {
    setActiveRenewal({ ...renewal, loading: true });
    setDetailLoading(true);
    try {
      const response = await renewalService.getRenewalById(renewal.id);
      setActiveRenewal(response?.data ?? response);
    } catch (err) {
      setActiveRenewal({ ...renewal, error: err?.message || "Could not load renewal details." });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <button type="button" className="hover:text-[#302d36]" onClick={() => onNavigate("/branch/dashboard")}>Home</button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Renewals</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#302d36] tracking-tight">Renewals</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">{total} Records</span>
          </div>
          <p className="text-xs text-[#716d78]">Renewal records returned by the renewals service.</p>
        </div>
        <button type="button" onClick={fetchRenewals} disabled={loading} className="rounded-lg bg-[#f7f6f8] px-4 py-2.5 text-xs font-bold text-[#302d36] disabled:opacity-50">Refresh</button>
      </header>

      {error && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-4 text-sm text-[#93000a]">{error}</div>}

      <section className="overflow-x-auto rounded-xl border border-[#f0eef3] bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead><tr className="h-10 border-b border-[#f0eef3] bg-[#f7f6f8]/70 text-[11px] font-bold uppercase tracking-wider text-[#716d78]">
            <th className="px-5 py-2">Policy</th><th className="px-5 py-2">Due date</th><th className="px-5 py-2 text-center">Status</th><th className="px-5 py-2 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-[#f0eef3]">
            {loading ? <tr><td colSpan={4} className="py-12 text-center text-[#827e89]">Loading renewals...</td></tr>
              : renewals.length === 0 ? <tr><td colSpan={4} className="py-12 text-center text-[#827e89]">No renewals returned.</td></tr>
                : renewals.map((renewal) => (
                  <tr key={renewal.id} className="h-14 hover:bg-[#f7f6f8]/50">
                    <td className="px-5 py-3 font-semibold text-[#302d36]">{renewal.policyId ? "Linked policy" : "—"}</td>
                    <td className="px-5 py-3 text-[#716d78]">{renewal.dueDate ? formatDate(renewal.dueDate) : "—"}</td>
                    <td className="px-5 py-3 text-center"><span className="rounded-full bg-[#cadeff] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#061c35]">{renewal.status || "—"}</span></td>
                    <td className="px-5 py-3 text-right"><button type="button" onClick={() => openDetails(renewal)} className="rounded border border-[#e7e4eb] px-2.5 py-1 font-semibold text-[#302d36] hover:bg-[#f7f6f8]">Details</button></td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-[#f0eef3] bg-[#f7f6f8]/70 px-5 py-3 text-xs text-[#716d78]">
          <span>Showing {renewals.length} of {total} renewals</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded border border-[#e7e4eb] bg-white px-3 py-1 disabled:opacity-40">Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded border border-[#e7e4eb] bg-white px-3 py-1 disabled:opacity-40">Next</button></div>
        </div>
      </section>

      {activeRenewal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 p-4"><section role="dialog" aria-modal="true" aria-labelledby="renewal-details-title" className="w-full max-w-lg rounded-xl border border-[#f0eef3] bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 id="renewal-details-title" className="text-lg font-bold text-[#302d36]">Renewal details</h2><button type="button" onClick={() => setActiveRenewal(null)} className="rounded px-2 py-1 text-sm">Close</button></div>{detailLoading || activeRenewal.loading ? <p className="py-6 text-center text-sm text-[#827e89]">Loading renewal details...</p> : activeRenewal.error ? <p role="alert" className="py-4 text-sm text-[#ba1a1a]">{activeRenewal.error}</p> : <dl className="grid grid-cols-2 gap-3 text-sm">{[["Policy", activeRenewal.policyId ? "Linked policy" : null], ["Due date", activeRenewal.dueDate ? formatDate(activeRenewal.dueDate) : null], ["Status", activeRenewal.status]].filter(([, value]) => value != null).map(([label, value]) => <div key={label}><dt className="text-xs text-[#827e89]">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>}</section></div>}
    </div>
  );
};
