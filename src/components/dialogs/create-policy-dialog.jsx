import { useState, useEffect } from "react";
import { customerService } from "@/services/customer-service";
import { policyService } from "@/services/policy-service";

export const CreatePolicyDialog = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    customerId: "",
    policyNumber: "",
    insurer: "",
    product: "",
    policyType: "",
    premium: "",
    startDate: "",
    expiryDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingCustomers(true);
      customerService
        .getCustomers({ limit: 50 })
        .then((res) => {
          const customerRows = Array.isArray(res?.data) ? res.data : [];
          setCustomers(customerRows);
          if (customerRows.length > 0 && !formData.customerId) {
            setFormData((prev) => ({ ...prev, customerId: customerRows[0].id }));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCustomers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.customerId) {
      setErrorMessage("Please select an active policy customer");
      return;
    }
    if (!formData.policyNumber) {
      setErrorMessage("Policy Number is required");
      return;
    }
    try {
      setSubmitting(true);
      await policyService.createPolicy({
        ...formData,
        premium: Number(formData.premium),
        startDate: new Date(formData.startDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
      });
      onCreated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to provision policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#f0eef3] flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 bg-[#f7f6f8] border-b border-[#e7e4eb] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7054a5] text-[#ffffff] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">add_moderator</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#2f2c35] leading-tight">Create Insurance Policy</h2>
              <p className="text-[12px] text-[#716d78]">Issue a new institutional underwritten policy schedule.</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[#302d36] flex items-center justify-between">
                <span>Customer / Insured Entity <span className="text-[#ba1a1a]">*</span></span>
                {loadingCustomers && <span className="text-[10px] text-[#827e89]">Loading clients...</span>}
              </label>
              <select
                value={formData.customerId}
                onChange={update("customerId")}
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              >
                <option value="">Select Insured Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.phone ? ` — ${c.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Policy Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Policy Number <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={update("policyNumber")}
                placeholder="e.g., POL-9021"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm font-mono text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white uppercase"
              />
            </div>

            {/* Insurer */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Underwriting Insurer <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.insurer}
                onChange={update("insurer")}
                placeholder="Enter insurer name"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>

            {/* Product */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Product Line <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={update("product")}
                placeholder="e.g., Comprehensive Auto, Term Life 30Y"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>

            {/* Policy Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Coverage Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.policyType}
                onChange={update("policyType")}
                placeholder="Policy type"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>

            {/* Premium */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Annual Premium (₹) <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: Number(e.target.value) })}
                placeholder="Enter premium"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm font-mono text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Initial Status</label>
              <select
                value={formData.status}
                onChange={update("status")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Effective Start Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={update("startDate")}
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Expiration Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={update("expiryDate")}
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
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
            <span>{submitting ? "Provisioning..." : "+ Issue Policy"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
