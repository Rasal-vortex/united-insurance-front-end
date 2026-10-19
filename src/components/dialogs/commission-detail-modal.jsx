"use client";

import { useEffect, useState } from "react";
import { commissionService } from "@/services/commission-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const statuses = ["PENDING", "PAID", "CANCELLED"];

export const CommissionDetailModal = ({ commission, isOpen, onClose, onUpdated, onStartEdit, user, mode = "view" }) => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isBranch = user?.userType === "BRANCH";

  useEffect(() => {
    setAmount(commission?.amount == null ? "" : String(commission.amount));
    setStatus(commission?.status || "");
    setError("");
  }, [commission]);

  if (!isOpen || !commission) return null;

  const save = async () => {
    const payload = {};
    if (amount !== String(commission.amount ?? "")) payload.amount = Number(amount);
    if (status !== (commission.status || "")) payload.status = status;
    if (!Object.keys(payload).length) return;
    setSaving(true);
    setError("");
    try {
      const response = await commissionService.updateCommission(commission.id, payload);
      if (response?.success === false) throw new Error(response.message || "Commission update failed.");
      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Could not update the commission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="commission-detail-title" className="w-full max-w-2xl rounded-xl border border-[#f0eef3] bg-white p-6 shadow-2xl">
        <header className="mb-5 flex items-center justify-between border-b border-[#f0eef3] pb-4">
          <div>
            <h2 id="commission-detail-title" className="text-xl font-bold text-[#302d36]">{mode === "edit" ? "Edit commission" : "Commission details"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isBranch && mode === "view" && !commission.loading && !commission.error && <button type="button" onClick={onStartEdit} className="rounded-lg border border-[#e7e4eb] px-3 py-2 text-sm font-semibold hover:bg-[#f7f6f8]">Edit</button>}
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-[#f7f6f8]">Close</button>
          </div>
        </header>
        {error && <p role="alert" className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]">{error}</p>}
        {commission.loading ? <p className="py-8 text-center text-sm text-[#827e89]">Loading commission…</p> : commission.error ? <p role="alert" className="py-6 text-sm text-[#93000a]">{commission.error}</p> : (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><dt className="text-xs text-[#827e89]">Amount (₹)</dt><dd className="mt-1 font-medium">{commission.amount == null ? "—" : formatCurrency(commission.amount)}</dd></div>
            <div><dt className="text-xs text-[#827e89]">Status</dt><dd className="mt-1 font-medium">{commission.status || "—"}</dd></div>
            {commission.earnedAt != null && <div><dt className="text-xs text-[#827e89]">Earned date</dt><dd className="mt-1 font-medium">{formatDate(commission.earnedAt)}</dd></div>}
            {commission.paidAt != null && <div><dt className="text-xs text-[#827e89]">Paid date</dt><dd className="mt-1 font-medium">{formatDate(commission.paidAt)}</dd></div>}
          </dl>
        )}
        {isBranch && mode === "edit" && !commission.loading && !commission.error && (
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#f0eef3] pt-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Amount (₹)
              <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal">
                {status && !statuses.includes(status) && <option value={status}>{status}</option>}
                {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" onClick={save} disabled={saving || (amount === String(commission.amount ?? "") && status === (commission.status || ""))} className="rounded-lg bg-[#7054a5] px-4 py-2 text-sm font-bold text-[#ffffff] disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
