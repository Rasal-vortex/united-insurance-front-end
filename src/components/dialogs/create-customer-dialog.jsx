import { useState } from "react";
import { customerService } from "@/services/customer-service";

export const CreateCustomerDialog = ({ isOpen, onClose, onCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "MALE",
    address: "",
    notes: "",
    status: "ACTIVE",
  });

  if (!isOpen) return null;

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("Customer name and phone number are required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, value]) => String(value ?? "").trim() !== ""),
      );
      await customerService.createCustomer(payload);
      onCreated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to create customer");
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
              <span className="material-symbols-outlined text-lg">person_add</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#2f2c35] leading-tight">Create Customer Profile</h2>
              <p className="text-[12px] text-[#716d78]">Register a new individual or institutional client.</p>
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
              Full Name / Legal Entity <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={update("name")}
              placeholder="e.g., Sarah Jenkins"
              required
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Phone Number <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={update("phone")}
                placeholder="+1 (555) 000-0000"
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Email Address</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={update("email")}
                placeholder="client@example.com"
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Gender</label>
              <select
                value={formData.gender}
                onChange={update("gender")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other / Corporate</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Physical Address</label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={update("address")}
              placeholder="Street address, city, state, zip code..."
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Client Notes</label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={update("notes")}
              placeholder="Underwriting history or relationship notes..."
              className="p-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white resize-none"
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
              {submitting ? "sync" : "check_circle"}
            </span>
            <span>{submitting ? "Saving..." : "Create Customer"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
