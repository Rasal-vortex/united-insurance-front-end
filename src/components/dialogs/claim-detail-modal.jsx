import { useEffect, useState } from "react";
import { claimService } from "@/services/claim-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const claimStatuses = ["REPORTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "SETTLED"];

export const ClaimDetailModal = ({ claim, isOpen, onClose, onUpdated, user, mode = "view" }) => {
  const [status, setStatus] = useState(claim?.status || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isBranch = user?.userType === "BRANCH";

  useEffect(() => {
    setStatus(claim?.status || "");
    setError("");
  }, [claim]);

  if (!isOpen || !claim) return null;

  const saveStatus = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await claimService.updateClaim(claim.id, { status });
      if (response?.success === false) throw new Error(response.message || "Claim update failed.");
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Could not update claim status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="claim-detail-title" className="w-full max-w-2xl rounded-xl border border-[#f0eef3] bg-white p-6 shadow-2xl">
        <header className="mb-5 flex items-center justify-between border-b border-[#f0eef3] pb-4">
          <div>
            <h2 id="claim-detail-title" className="text-xl font-bold text-[#302d36]">{mode === "edit" ? "Edit claim status" : "Claim details"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-[#f7f6f8]">Close</button>
        </header>
        {error && <p role="alert" className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]">{error}</p>}
        {claim.loading ? <p className="py-8 text-center text-sm text-[#827e89]">Loading claim details…</p> : claim.error ? <p role="alert" className="py-6 text-sm text-[#93000a]">{claim.error}</p> : <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {claim.claimNumber != null && <div><dt className="text-xs text-[#827e89]">Claim Number</dt><dd className="mt-1 font-medium">{claim.claimNumber}</dd></div>}
          {claim.claimDate != null && <div><dt className="text-xs text-[#827e89]">Claim Date</dt><dd className="mt-1 font-medium">{formatDate(claim.claimDate)}</dd></div>}
          {claim.status != null && <div><dt className="text-xs text-[#827e89]">Status</dt><dd className="mt-1 font-medium">{claim.status}</dd></div>}
          {claim.amount != null && <div><dt className="text-xs text-[#827e89]">Amount</dt><dd className="mt-1 font-medium">{formatCurrency(claim.amount)}</dd></div>}
          {claim.notes != null && <div className="sm:col-span-2"><dt className="text-xs text-[#827e89]">Notes</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{claim.notes}</dd></div>}
        </dl>}
        {isBranch && mode === "edit" && !claim.loading && !claim.error && (
          <div className="mt-6 flex flex-col gap-3 border-t border-[#f0eef3] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Update status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-56 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 py-2 text-sm font-normal">
                {status && !claimStatuses.includes(status) && <option value={status}>{status}</option>}
                {claimStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <button type="button" onClick={saveStatus} disabled={saving || status === claim.status} className="rounded-lg bg-[#7054a5] px-4 py-2 text-sm font-bold text-[#ffffff] disabled:opacity-50">{saving ? "Saving…" : "Save status"}</button>
          </div>
        )}
      </section>
    </div>
  );
};
