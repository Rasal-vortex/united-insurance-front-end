import { useState, useEffect } from "react";
import { customerService } from "@/services/customer-service";
import { leadService } from "@/services/lead-service";
import { followUpService } from "@/services/followup-service";

export const CreateFollowUpDialog = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    dueAt: "",
    customerId: "",
    leadId: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        customerService.getCustomers({ limit: 50 }),
        leadService.getLeads({ limit: 50 }),
      ])
        .then(([custRes, leadRes]) => {
          setCustomers(Array.isArray(custRes?.data) ? custRes.data : []);
          setLeads(Array.isArray(leadRes?.data) ? leadRes.data : []);
        })
        .catch((err) => setErrorMessage(err?.message || "Could not load customers and leads."));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.title.trim() || !formData.dueAt) {
      setErrorMessage("Task title and due date are required");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        dueAt: new Date(formData.dueAt).toISOString(),
      };
      if (formData.customerId) payload.customerId = formData.customerId;
      if (formData.leadId) payload.leadId = formData.leadId;
      if (formData.status) payload.status = formData.status;
      if (formData.notes.trim()) payload.notes = formData.notes.trim();
      await followUpService.createFollowUp(payload);
      onCreated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to schedule follow-up");
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
              <span className="material-symbols-outlined text-lg">calendar_add_on</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#2f2c35] leading-tight">Schedule Follow-up</h2>
              <p className="text-[12px] text-[#716d78]">Set an underwriter action or client callback reminder.</p>
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
              Action Title <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={update("title")}
              placeholder="Enter a follow-up title"
              required
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">
                Due Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.dueAt}
                onChange={update("dueAt")}
                required
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#302d36]">Status</label>
              <select
                value={formData.status}
                onChange={update("status")}
                className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
              >
                <option value="">Select a status (optional)</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Associated Customer</label>
            <select
              value={formData.customerId || ""}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: "" })}
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            >
              <option value="">None / Optional</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Or Associated Lead</label>
            <select
              value={formData.leadId || ""}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: "" })}
              className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] focus:outline-none focus:border-[#7054a5] focus:bg-white"
            >
              <option value="">None / Optional</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#302d36]">Task Details &amp; Agenda</label>
            <textarea
              rows={2}
              value={formData.notes || ""}
              onChange={update("notes")}
              placeholder="Optional notes"
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
            <span>{submitting ? "Scheduling..." : "Set Reminder"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
