import { useCallback, useEffect, useState } from "react";
import { followUpService } from "@/services/followup-service";
import { formatDate } from "@/lib/utils";
import { CreateFollowUpDialog } from "@/components/dialogs/create-followup-dialog";

export const FollowUpsPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchFollowUps = useCallback(() => {
    setLoading(true);
    setError("");
    followUpService.getFollowUps({ page, limit })
      .then((response) => {
        if (!Array.isArray(response?.data)) throw new Error("The follow-ups response did not contain a data array.");
        setFollowUps(response.data);
        const responseTotal = Number(response?.meta?.total ?? response?.pagination?.total ?? response.data.length);
        setTotal(responseTotal);
        setTotalPages(Number(response?.meta?.totalPages ?? response?.pagination?.totalPages ?? Math.max(1, Math.ceil(responseTotal / limit))));
      })
      .catch((err) => setError(err?.message || "Failed to load follow-ups."))
      .finally(() => setLoading(false));
  }, [page, limit]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  const openDetails = async (item) => {
    setActiveFollowUp({ ...item, loading: true });
    setDetailLoading(true);
    try {
      const response = await followUpService.getFollowUpById(item.id);
      setActiveFollowUp(response?.data ?? response);
    } catch (err) {
      setActiveFollowUp({ ...item, error: err?.message || "Could not load follow-up details." });
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (item, nextStatus) => {
    if (!isBranch || item.status === "CANCELLED") return;
    setBusyId(item.id);
    setActionError("");
    try {
      await followUpService.updateFollowUp(item.id, {
        status: nextStatus,
        ...(nextStatus === "COMPLETED" ? { completedAt: new Date().toISOString() } : {})
      });
      fetchFollowUps();
    } catch (err) {
      setActionError(err?.message || "Could not update this follow-up.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteFollowUp = async (item) => {
    if (!isBranch || !window.confirm("Delete this follow-up?")) return;
    setBusyId(item.id);
    setActionError("");
    try {
      await followUpService.deleteFollowUp(item.id);
      fetchFollowUps();
    } catch (err) {
      setActionError(err?.message || "Could not delete this follow-up.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <button type="button" className="hover:text-[#302d36]" onClick={() => onNavigate("/branch/dashboard")}>Home</button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Follow-ups</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#302d36] tracking-tight">Follow-ups &amp; Task Reminders</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">{total} Records</span>
          </div>
          <p className="text-xs text-[#716d78]">Track customer and lead reminders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={fetchFollowUps} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f7f6f8] text-[#302d36] text-xs font-bold rounded-lg">Refresh</button>
          {isBranch && <button type="button" onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#7054a5] text-[#ffffff] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm"><span className="material-symbols-outlined text-[18px]">add_task</span>Schedule Follow-up</button>}
        </div>
      </div>

      {(error || actionError) && <div role="alert" className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">{error || actionError}</div>}

      <div className="bg-white rounded-xl border border-[#f0eef3] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead><tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#f0eef3]">
              <th className="px-5 py-2 w-10">Done</th><th className="px-5 py-2">Action Title</th><th className="px-5 py-2">Associated Contact</th><th className="px-5 py-2">Assigned Staff</th><th className="px-5 py-2">Due Date</th><th className="px-5 py-2 text-center">Status</th><th className="px-5 py-2 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-[#f0eef3]">
              {loading ? <tr><td colSpan={7} className="py-12 text-center text-[#827e89]">Loading follow-ups...</td></tr> : followUps.length === 0 ? <tr><td colSpan={7} className="py-12 text-center text-[#827e89]">No follow-ups returned.</td></tr> : followUps.map((item) => (
                <tr key={item.id} className="hover:bg-[#f7f6f8]/50 transition-colors h-14">
                  <td className="px-5 py-3"><input type="checkbox" checked={item.status === "COMPLETED"} disabled={!isBranch || item.status === "CANCELLED" || busyId === item.id} onChange={() => updateStatus(item, item.status === "COMPLETED" ? "PENDING" : "COMPLETED")} aria-label={`Mark ${item.title || "follow-up"} complete`} className="w-4 h-4 rounded text-[#7054a5] cursor-pointer disabled:cursor-not-allowed" /></td>
                  <td className="px-5 py-3"><div className="flex flex-col"><span className={`font-bold text-sm ${item.status === "COMPLETED" ? "line-through text-[#827e89]" : "text-[#302d36]"}`}>{item.title || "-"}</span>{item.notes && <span className="text-[11px] text-[#716d78] mt-0.5">{item.notes}</span>}</div></td>
                  <td className="px-5 py-3 font-semibold text-[#302d36]">-</td>
                  <td className="px-5 py-3 text-[#716d78]">-</td>
                  <td className="px-5 py-3 font-semibold text-[#302d36]">{item.dueAt ? formatDate(item.dueAt) : "-"}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === "COMPLETED" ? "bg-[#7054a5] text-[#ffffff]" : item.status === "CANCELLED" ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#cadeff] text-[#061c35]"}`}>{item.status || "-"}</span></td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => openDetails(item)} title="View follow-up details" aria-label="View follow-up details" className="p-1 rounded text-[#716d78] hover:bg-[#f7f6f8]"><span className="material-symbols-outlined text-base">visibility</span></button>
                    {isBranch && <button type="button" onClick={() => deleteFollowUp(item)} disabled={busyId === item.id} title="Delete follow-up" aria-label="Delete follow-up" className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] disabled:opacity-50"><span className="material-symbols-outlined text-base">delete</span></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#f0eef3] bg-[#f7f6f8]/70 px-5 py-3 text-xs text-[#716d78]">
          <span>Showing {followUps.length} of {total} follow-ups</span>
          <div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded border border-[#e7e4eb] bg-white px-3 py-1 disabled:opacity-40">Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded border border-[#e7e4eb] bg-white px-3 py-1 disabled:opacity-40">Next</button></div>
        </div>
      </div>

      {activeFollowUp && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl border border-[#f0eef3] bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d36]">Follow-up details</h2><button type="button" onClick={() => setActiveFollowUp(null)} className="rounded px-2 py-1 text-sm">Close</button></div>{detailLoading || activeFollowUp.loading ? <p className="py-6 text-center text-sm text-[#827e89]">Loading follow-up details...</p> : activeFollowUp.error ? <p role="alert" className="py-4 text-sm text-[#ba1a1a]">{activeFollowUp.error}</p> : <dl className="grid grid-cols-2 gap-3 text-sm">{[["Title", activeFollowUp.title], ["Due date", activeFollowUp.dueAt ? formatDate(activeFollowUp.dueAt) : null], ["Status", activeFollowUp.status], ["Notes", activeFollowUp.notes], ["Completed at", activeFollowUp.completedAt ? formatDate(activeFollowUp.completedAt) : null]].filter(([, value]) => value != null).map(([label, value]) => <div key={label}><dt className="text-xs text-[#827e89]">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>}</section></div>}

      {isBranch && <CreateFollowUpDialog isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchFollowUps} />}
    </div>
  );
};
