import React, { useState, useEffect } from 'react';
import { Customer, Lead } from '@/types/crm';
import { customerService } from '@/services/customer-service';
import { leadService } from '@/services/lead-service';
import { followUpService, CreateFollowUpInput } from '@/services/followup-service';

interface CreateFollowUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateFollowUpDialog: React.FC<CreateFollowUpDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateFollowUpInput>({
    title: '',
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '',
    leadId: '',
    status: 'PENDING',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        customerService.getCustomers({ limit: 50 }),
        leadService.getLeads({ limit: 50 }),
      ])
        .then(([custRes, leadRes]) => {
          setCustomers(custRes.data);
          setLeads(leadRes.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.title.trim() || !formData.dueAt) {
      setErrorMessage('Task title and due date are required');
      return;
    }

    try {
      setSubmitting(true);
      await followUpService.createFollowUp(formData);
      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#e6eeff] flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 bg-[#eff3ff] border-b border-[#d6e3fc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002c26] text-[#93f4e3] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">calendar_add_on</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#021129] leading-tight">Schedule Follow-up</h2>
              <p className="text-[12px] text-[#44474d]">Set an underwriter action or client callback reminder.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#75777e] hover:bg-[#dde9ff] hover:text-[#021129] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">
              Action Title <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Call renewal discussion with Horizon Logistics"
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Due Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Associated Customer</label>
            <select
              value={formData.customerId || ''}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: '' })}
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            >
              <option value="">None / Optional</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Or Associated Lead</label>
            <select
              value={formData.leadId || ''}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: '' })}
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            >
              <option value="">None / Optional</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} — {l.interest}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Task Details & Agenda</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Underwriting stipulations or follow-up discussion points..."
              className="p-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white resize-none"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-[#eff3ff] border-t border-[#d6e3fc] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#d6e3fc] text-[#0f1c2e] text-xs font-semibold hover:bg-[#e6eeff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {submitting ? 'sync' : 'check_circle'}
            </span>
            <span>{submitting ? 'Scheduling...' : 'Set Reminder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
