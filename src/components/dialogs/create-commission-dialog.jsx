"use client";

import { useEffect, useState } from "react";
import { commissionService } from "@/services/commission-service";
import { customerService } from "@/services/customer-service";
import { policyService } from "@/services/policy-service";

const statuses = ["PENDING", "PAID", "CANCELLED"];
const toIsoDate = (value) => value ? new Date(value).toISOString() : undefined;

export const CreateCommissionDialog = ({ isOpen, onClose, onCreated }) => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [earnedAt, setEarnedAt] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setStatus("");
      setEarnedAt("");
      setPaidAt("");
      setCustomerId("");
      setPolicyId("");
      setError("");
      Promise.all([
        customerService.getCustomers({ page: 1, limit: 100 }),
        policyService.getPolicies({ page: 1, limit: 100 }),
      ]).then(([customerResponse, policyResponse]) => {
        setCustomers(Array.isArray(customerResponse?.data) ? customerResponse.data : []);
        setPolicies(Array.isArray(policyResponse?.data) ? policyResponse.data : []);
      }).catch(() => {
        setCustomers([]);
        setPolicies([]);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = { amount: Number(amount) };
    if (status) payload.status = status;
    if (customerId) payload.customerId = customerId;
    if (policyId) payload.policyId = policyId;
    if (earnedAt) payload.earnedAt = toIsoDate(earnedAt);
    if (paidAt) payload.paidAt = toIsoDate(paidAt);
    try {
      const response = await commissionService.createCommission(payload);
      if (response?.success === false) throw new Error(response.message || "Commission creation failed.");
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Could not create the commission.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292631]/60 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="create-commission-title" className="w-full max-w-lg rounded-xl border border-[#f0eef3] bg-white p-6 shadow-2xl">
        <header className="mb-5 flex items-center justify-between border-b border-[#f0eef3] pb-4">
          <div>
            <h2 id="create-commission-title" className="text-xl font-bold text-[#302d36]">Add commission</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm hover:bg-[#f7f6f8]">Close</button>
        </header>
        {error && <p role="alert" className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]">{error}</p>}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Amount (₹) <span className="text-[#ba1a1a]">Required</span>
            <input type="number" min="0" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal">
              <option value="">Select status</option>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Customer (optional)
            <select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setPolicyId(""); }} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal">
              <option value="">No customer linked</option>
              {customers.filter((customer) => customer?.id && customer?.name).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Policy (optional)
            <select value={policyId} onChange={(event) => { const nextId = event.target.value; setPolicyId(nextId); const policy = policies.find((row) => row.id === nextId); if (policy?.customerId) setCustomerId(policy.customerId); }} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal">
              <option value="">No policy linked</option>
              {policies.filter((policy) => policy?.id && policy?.policyNumber && (!customerId || policy.customerId === customerId)).map((policy) => <option key={policy.id} value={policy.id}>{policy.policyNumber}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Earned date
            <input type="datetime-local" value={earnedAt} onChange={(event) => setEarnedAt(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#302d36]">Paid date
            <input type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="h-10 rounded-lg border border-[#e7e4eb] bg-[#f7f6f8] px-3 text-sm font-normal" />
          </label>
          <footer className="mt-2 flex justify-end gap-2 border-t border-[#f0eef3] pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-[#e7e4eb] px-4 py-2 text-sm font-semibold text-[#302d36]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#7054a5] px-4 py-2 text-sm font-bold text-[#ffffff] disabled:opacity-50">{saving ? "Saving…" : "Create commission"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
};
