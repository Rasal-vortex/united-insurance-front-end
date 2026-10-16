import React, { useState, useEffect } from 'react';
import { Renewal } from '@/types/crm';
import { renewalService } from '@/services/renewal-service';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RenewalsPageProps {
  onNavigate: (path: string) => void;
}

export const RenewalsPage: React.FC<RenewalsPageProps> = ({ onNavigate }) => {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRenewals = () => {
    setLoading(true);
    renewalService
      .getRenewals()
      .then((res) => setRenewals(res.data))
      .catch((err) => console.error('Failed to load renewals:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleRenew = async (id: string) => {
    try {
      setProcessingId(id);
      await renewalService.updateRenewal(id, { status: 'RENEWED' });
      fetchRenewals();
    } catch {
      alert('Failed to process renewal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
              Home
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Renewals</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Policy Renewals Queue</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              142 Approaching Expiry
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Review policies approaching 30/60-day expiry windows, underwriter quotes, and automated ledger bindings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/branch/policies')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#eff3ff] border border-[#d6e3fc] hover:bg-[#dde9ff] text-[#0f1c2e] text-xs font-bold rounded-lg shadow-xs"
        >
          <span className="material-symbols-outlined text-base">policy</span>
          <span>View All Policies</span>
        </button>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Policy Number</th>
                <th className="px-5 py-2">Customer</th>
                <th className="px-5 py-2">Expiry Date</th>
                <th className="px-5 py-2 text-right">Previous Premium</th>
                <th className="px-5 py-2 text-right">Renewal Quote</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    Loading renewals schedule...
                  </td>
                </tr>
              ) : (
                renewals.map((r) => (
                  <tr key={r.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3 font-mono font-bold text-[#17263f]">{r.policyNumber || 'POL-9021'}</td>
                    <td className="px-5 py-3 font-semibold text-[#0f1c2e]">{r.customerName || 'Insured Client'}</td>
                    <td className="px-5 py-3 text-[#44474d]">{formatDate(r.expiryDate)}</td>
                    <td className="px-5 py-3 text-right font-mono text-[#44474d] tabular-nums">
                      {formatCurrency(r.previousPremium)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-[#0f1c2e] tabular-nums">
                      {formatCurrency(r.renewalPremium)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'RENEWED'
                            ? 'bg-[#002c26] text-[#93f4e3]'
                            : 'bg-[#cadeff] text-[#061c35]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.status !== 'RENEWED' ? (
                        <button
                          type="button"
                          onClick={() => handleRenew(r.id)}
                          disabled={processingId === r.id}
                          className="px-3 py-1 rounded bg-[#002c26] text-[#93f4e3] hover:opacity-95 font-bold text-xs shadow-xs"
                        >
                          {processingId === r.id ? 'Processing...' : 'Bind Renewal'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#002c26] font-semibold flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-sm">verified</span> Renewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
