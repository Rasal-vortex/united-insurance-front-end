import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/crm';
import { customerService } from '@/services/customer-service';
import { policyService, CreatePolicyInput } from '@/services/policy-service';

interface CreatePolicyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreatePolicyDialog: React.FC<CreatePolicyDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePolicyInput>({
    customerId: '',
    policyNumber: `POL-${Math.floor(1000 + Math.random() * 9000)}`,
    insurer: 'Allianz Global',
    product: 'Comprehensive Auto',
    policyType: 'Individual',
    premium: 1850,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingCustomers(true);
      customerService
        .getCustomers({ limit: 50 })
        .then((res) => {
          setCustomers(res.data);
          if (res.data.length > 0 && !formData.customerId) {
            setFormData((prev) => ({ ...prev, customerId: res.data[0].id }));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCustomers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.customerId) {
      setErrorMessage('Please select an active policy customer');
      return;
    }
    if (!formData.policyNumber) {
      setErrorMessage('Policy Number is required');
      return;
    }

    try {
      setSubmitting(true);
      await policyService.createPolicy({
        ...formData,
        premium: Number(formData.premium),
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision policy');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#e6eeff] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eff3ff] border-b border-[#d6e3fc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002c26] text-[#93f4e3] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">add_moderator</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#021129] leading-tight">Create Insurance Policy</h2>
              <p className="text-[12px] text-[#44474d]">
                Issue a new institutional underwritten policy schedule.
              </p>
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

        {/* API Endpoint Banner */}
        <div className="px-6 py-2 bg-[#e6eeff] flex items-center justify-between text-[11px] text-[#44474d] border-b border-[#d6e3fc]">
          <span className="font-mono flex items-center gap-1.5">
            <span className="bg-[#021129] text-white px-1.5 py-0.5 rounded text-[9px] font-bold">POST</span>
            <span>/api/policies</span>
          </span>
          <span className="text-[#002c26] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>Generates auto-renewal schedule</span>
          </span>
        </div>

        {/* Form Body */}
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
              <label className="text-xs font-semibold text-[#0f1c2e] flex items-center justify-between">
                <span>Customer / Insured Entity <span className="text-[#ba1a1a]">*</span></span>
                {loadingCustomers && <span className="text-[10px] text-[#75777e]">Loading clients...</span>}
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              >
                <option value="">Select Insured Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customerNumber}) — {c.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Policy Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Policy Number <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                placeholder="e.g., POL-9021"
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm font-mono text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white uppercase"
                required
              />
            </div>

            {/* Insurer */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Underwriting Insurer <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={formData.insurer}
                onChange={(e) => setFormData({ ...formData, insurer: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              >
                <option value="Allianz Global">Allianz Global</option>
                <option value="Travelers">Travelers</option>
                <option value="Prudential Mutual">Prudential Mutual</option>
                <option value="Liberty Mutual">Liberty Mutual</option>
                <option value="United Underwriters">United Underwriters</option>
              </select>
            </div>

            {/* Product */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Product Line <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="e.g., Comprehensive Auto, Term Life 30Y"
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>

            {/* Policy Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Coverage Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={formData.policyType}
                onChange={(e) => setFormData({ ...formData, policyType: e.target.value as any })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              >
                <option value="Individual">Individual</option>
                <option value="Commercial">Commercial</option>
                <option value="Group">Group</option>
              </select>
            </div>

            {/* Annual Premium */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Annual Premium ($) <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: Number(e.target.value) })}
                placeholder="1850.00"
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm font-mono text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Effective Start Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Expiration Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
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
              {submitting ? 'sync' : 'add_circle'}
            </span>
            <span>{submitting ? 'Provisioning...' : '+ Issue Policy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
