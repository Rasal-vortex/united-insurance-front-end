import { useState, useEffect } from "react";
import { customerService } from "@/services/customer-service";
import { policyService } from "@/services/policy-service";
import { claimService } from "@/services/claim-service";

export const CreateClaimDialog = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    claimDate: "",
    policyId: "",
    claimNumber: "",
    status: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        customerService.getCustomers({ limit: 50 }),
        policyService.getPolicies({ limit: 50 }),
      ])
        .then(([custRes, polRes]) => {
          setCustomers(Array.isArray(custRes?.data) ? custRes.data : []);
          setPolicies(Array.isArray(polRes?.data) ? polRes.data : []);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.customerId || !formData.claimDate) {
      setErrorMessage("Customer and Claim Date are required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        customerId: formData.customerId,
        claimDate: new Date(formData.claimDate).toISOString(),
      };
      if (formData.policyId) payload.policyId = formData.policyId;
      if (formData.claimNumber.trim()) payload.claimNumber = formData.claimNumber.trim();
      if (formData.status) payload.status = formData.status;
      if (formData.amount !== "") payload.amount = Number(formData.amount);
      if (formData.notes.trim()) payload.notes = formData.notes.trim();
      await claimService.createClaim(payload);
      onCreated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to file claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#f0eef3] flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 bg-[#f7f6f8] border-b border-[#e7e4eb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7054a5] text-[#ffffff] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#2f2c35] leading-tight">File New Insurance Claim</h2>
              <p className="text-[12px] text-[#716d78]">Initiate incident report into underwriter queue.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#827e89] hover:bg-[#ebe5f4] hover:text-[#2f2c35] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">
              Customer / Claimant <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value, policyId: "" })}
              required
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Related Policy</label>
            <select
              value={formData.policyId}
              onChange={update("policyId")}
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            >
              <option value="">Select Policy (Optional)</option>
              {policies
                .filter((p) => p.customerId === formData.customerId && p.policyNumber)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.policyNumber}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Claim Number</label>
              <input
                type="text"
                value={formData.claimNumber}
                onChange={update("claimNumber")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm font-mono text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Claim Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.claimDate}
                onChange={update("claimDate")}
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Requested Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={update("amount")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm font-mono text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Initial Status</label>
              <select
                value={formData.status}
                onChange={update("status")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              >
                <option value="">Select a status (optional)</option>
                <option value="REPORTED">REPORTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SETTLED">SETTLED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Incident Notes &amp; Peril Details</label>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={update("notes")}
              placeholder="Describe incident circumstance, damages, and police report numbers..."
              className="p-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] placeholder:text-[#827e89] focus:outline-none focus:border-[#7054a5] focus:bg-white resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f7f6f8] border-t border-[#e7e4eb] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#e7e4eb] text-[#302d36] text-xs font-semibold hover:bg-[#f0eef3] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#7054a5] text-[#ffffff] hover:opacity-95 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {submitting ? "sync" : "add_circle"}
            </span>
            <span>{submitting ? "Filing..." : "+ File Claim"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
