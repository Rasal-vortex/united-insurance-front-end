import React, { useState, useEffect } from 'react';
import { Customer, Policy } from '@/types/crm';
import { customerService } from '@/services/customer-service';
import { policyService } from '@/services/policy-service';
import { claimService, CreateClaimInput } from '@/services/claim-service';

interface CreateClaimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateClaimDialog: React.FC<CreateClaimDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClaimInput>({
    customerId: '',
    claimDate: new Date().toISOString().split('T')[0],
    policyId: '',
    claimNumber: `CLM-2024-${Math.floor(100 + Math.random() * 900)}`,
    status: 'REPORTED',
    amount: 3200,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        customerService.getCustomers({ limit: 50 }),
        policyService.getPolicies({ limit: 50 }),
      ])
        .then(([custRes, polRes]) => {
          setCustomers(custRes.data);
          setPolicies(polRes.data);
          if (custRes.data.length > 0 && !formData.customerId) {
            setFormData((prev) => ({
              ...prev,
              customerId: custRes.data[0].id,
              policyId: polRes.data[0]?.id || '',
            }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.customerId || !formData.claimDate) {
      setErrorMessage('Customer and Claim Date are required');
      return;
    }

    try {
      setSubmitting(true);
      await claimService.createClaim({
        ...formData,
        amount: Number(formData.amount),
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to file claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#e6eeff] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eff3ff] border-b border-[#d6e3fc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002c26] text-[#93f4e3] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">health_and_safety</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#021129] leading-tight">File New Insurance Claim</h2>
              <p className="text-[12px] text-[#44474d]">
                Initiate incident report into underwriter queue.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">
              Customer / Claimant <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Related Policy */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Related Policy</label>
            <select
              value={formData.policyId}
              onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
              className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
            >
              <option value="">Select Policy (Optional)</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.policyNumber} — {p.product} ({p.insurer})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Claim Number */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Claim Number</label>
              <input
                type="text"
                value={formData.claimNumber}
                onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm font-mono text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
              />
            </div>

            {/* Claim Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">
                Claim Date <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                value={formData.claimDate}
                onChange={(e) => setFormData({ ...formData, claimDate: e.target.value })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Claim Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0f1c2e]">Requested Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm font-mono text-[#0f1c2e] focus:outline-none focus:border-[#002c26] focus:bg-white"
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
                <option value="REPORTED">REPORTED</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SETTLED">SETTLED</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#0f1c2e]">Incident Notes & Peril Details</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe incident circumstance, damages, and police report numbers..."
              className="p-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] placeholder:text-[#75777e] focus:outline-none focus:border-[#002c26] focus:bg-white resize-none"
            />
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
            <span>{submitting ? 'Filing...' : '+ File Claim'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
