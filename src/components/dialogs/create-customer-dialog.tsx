import React, { useState } from 'react';
import { customerService, CreateCustomerInput } from '@/services/customer-service';

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCustomerInput>({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'MALE',
    address: '',
    notes: '',
    status: 'ACTIVE',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Customer name and phone number are required');
      return;
    }

    try {
      setSubmitting(true);
      await customerService.createCustomer(formData);
      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create customer');
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
              <span className="material-symbols-outlined text-lg">person_add</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#021129] leading-tight">Create Customer Profile</h2>
              <p className="text-[12px] text-[#44474d]">Register a new individual or institutional client.</p>
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
              Full Name / Legal Entity <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Sarah Jenkins"
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Phone Number <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Email Address</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Date of Birth</label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other / Corporate</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Physical Address</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, city, state, zip code..."
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Client Notes</label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Underwriting history or relationship notes..."
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
            <span>{submitting ? 'Saving...' : 'Create Customer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
