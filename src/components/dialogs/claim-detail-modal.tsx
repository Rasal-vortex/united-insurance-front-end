import React, { useState } from 'react';
import { Claim } from '@/types/crm';
import { claimService } from '@/services/claim-service';
import { formatCurrency } from '@/lib/utils';

interface ClaimDetailModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({ claim, isOpen, onClose, onUpdated }) => {
  const [approving, setApproving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !claim) return null;

  const handleApprove = async () => {
    try {
      setApproving(true);
      await claimService.updateClaim(claim.id, { status: 'APPROVED' });
      setSuccessMessage('Disbursement packet approved and routed for batch wire.');
      if (onUpdated) onUpdated();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch {
      alert('Failed to approve disbursement');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17263f]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl border border-[#e6eeff] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#002c26] text-[#93f4e3] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#0f1c2e] font-mono">{claim.claimNumber}</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#dde9ff] text-[#061c35] uppercase">
                  {claim.status}
                </span>
              </div>
              <p className="text-xs text-[#44474d] mt-0.5">
                Policy Holder: <strong className="text-[#0f1c2e]">{claim.customerName}</strong> | Policy:{' '}
                <strong className="text-[#0f1c2e] font-mono">{claim.policyNumber || 'POL-8942'}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#44474d] hover:bg-[#eff3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {successMessage && (
          <div className="my-3 p-3 rounded-lg bg-[#002c26] text-[#93f4e3] text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* 3 Metric Summary Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4">
          <div className="p-4 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#44474d] uppercase tracking-wider">Settlement Request</span>
            <span className="text-2xl text-[#0f1c2e] font-bold tabular-nums">
              {formatCurrency(claim.amount)}
            </span>
            <span className="text-xs text-[#002c26] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">verified</span> Deductible Met ($500.00)
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#44474d] uppercase tracking-wider">Adjudication Tier</span>
            <span className="text-base text-[#0f1c2e] font-bold mt-1">
              {claim.adjudicationTier || 'Tier 1 FastTrack'}
            </span>
            <span className="text-xs text-[#4d5f7b]">Auto collision physical loss</span>
          </div>

          <div className="p-4 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#44474d] uppercase tracking-wider">Assigned Adjuster</span>
            <span className="text-base text-[#0f1c2e] font-bold mt-1">
              {claim.adjusterName || 'Julian Thorne'}
            </span>
            <span className="text-xs text-[#44474d]">Field Assessment Completed</span>
          </div>
        </div>

        {/* Notes and Peril description */}
        {claim.notes && (
          <div className="mb-4 p-3.5 bg-[#f9f9ff] rounded-lg border border-[#e6eeff]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1">Adjuster Appraisal Notes</h4>
            <p className="text-xs text-[#0f1c2e] leading-relaxed">{claim.notes}</p>
          </div>
        )}

        {/* Claim Lifecycle & Audit History */}
        <div className="my-2">
          <h4 className="text-sm font-bold text-[#0f1c2e] mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#4d5f7b]">timeline</span>
            <span>Claim Lifecycle & Audit History</span>
          </h4>
          <div className="p-4 rounded-lg bg-[#eff3ff] border border-[#d6e3fc] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#002c26] mt-0.5 text-base">check_circle</span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#0f1c2e] font-semibold">Incident Report Logged via App</span>
                  <span className="text-[11px] text-[#44474d]">{claim.claimDate}</span>
                </div>
                <p className="text-xs text-[#44474d] mt-0.5">
                  Police incident report verified. Roadway casualty appraisal entered into underwriter ledger.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#4d5f7b] mt-0.5 text-base">engineering</span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#0f1c2e] font-semibold">Independent Estimator Appraisal</span>
                  <span className="text-[11px] text-[#44474d]">24h Review Window</span>
                </div>
                <p className="text-xs text-[#44474d] mt-0.5">
                  Parts breakdown uploaded and audited against national repair network rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 mt-4 border-t border-[#e6eeff] gap-3">
          <div className="flex items-center gap-1.5 text-[#75777e] text-xs">
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Secure Underwriter Adjudication Terminal</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#eff3ff] hover:bg-[#dde9ff] text-xs font-semibold text-[#0f1c2e] transition-colors"
            >
              Close Viewer
            </button>
            {claim.status !== 'APPROVED' && claim.status !== 'SETTLED' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="px-4 py-2 rounded-lg bg-[#002c26] text-[#93f4e3] hover:opacity-90 text-xs font-bold transition-opacity flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">payments</span>
                <span>{approving ? 'Processing...' : 'Approve Disbursement'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
