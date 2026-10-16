import React, { useState, useEffect } from 'react';
import { Commission } from '@/types/crm';
import { commissionService } from '@/services/commission-service';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CommissionsPageProps {
  onNavigate: (path: string) => void;
}

export const CommissionsPage: React.FC<CommissionsPageProps> = ({ onNavigate }) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = () => {
    setLoading(true);
    commissionService
      .getCommissions()
      .then((res) => setCommissions(res.data))
      .catch((err) => console.error('Failed to load commissions:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const totalCommissions = commissions.reduce((acc, c) => acc + c.amount, 0);
  const paidCommissions = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
              Home
            </span>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#0f1c2e] font-bold">Commissions</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Finance & Broker Commissions</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              Ledger Q3
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Underwriter override disbursements, broker split earnings, and settlement disbursement receipts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e6eeff] shadow-xs">
          <span className="text-xs text-[#44474d] uppercase font-bold">Total Earned Commissions</span>
          <div className="text-2xl font-bold text-[#0f1c2e] mt-2 tabular-nums">
            {formatCurrency(totalCommissions)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e6eeff] shadow-xs">
          <span className="text-xs text-[#44474d] uppercase font-bold">Disbursed (Paid)</span>
          <div className="text-2xl font-bold text-[#002c26] mt-2 tabular-nums">
            {formatCurrency(paidCommissions)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e6eeff] shadow-xs">
          <span className="text-xs text-[#44474d] uppercase font-bold">Pending Remittance</span>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-2 tabular-nums">
            {formatCurrency(totalCommissions - paidCommissions)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Policy Number</th>
                <th className="px-5 py-2">Client Entity</th>
                <th className="px-5 py-2 text-right">Commission Amount</th>
                <th className="px-5 py-2">Earned Date</th>
                <th className="px-5 py-2 text-center">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#75777e]">
                    Loading commission ledger...
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3 font-mono font-bold text-[#17263f]">
                      {c.policyNumber || 'POL-4890'}
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0f1c2e]">
                      {c.customerName || 'Vanguard Tech Group'}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-[#0f1c2e] text-sm tabular-nums">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-5 py-3 text-[#44474d]">{formatDate(c.earnedAt || c.createdAt)}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'PAID'
                            ? 'bg-[#002c26] text-[#93f4e3]'
                            : 'bg-[#cadeff] text-[#061c35]'
                        }`}
                      >
                        {c.status}
                      </span>
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
