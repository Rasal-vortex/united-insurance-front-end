"use client";

import { useCallback, useEffect, useState } from "react";
import { commissionService } from "@/services/commission-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreateCommissionDialog } from "@/components/dialogs/create-commission-dialog";
import { CommissionDetailModal } from "@/components/dialogs/commission-detail-modal";

const unwrap = (response) => response?.data ?? response;

const getReportTotals = (response) => {
  const report = unwrap(response);
  if (Array.isArray(report)) {
    return report.reduce((totals, row) => {
      const amount = Number(row?.amount ?? 0);
      if (row?.status === "PAID") totals.paid += amount;
      if (row?.status === "PENDING") totals.pending += amount;
      return totals;
    }, { paid: 0, pending: 0, period: "" });
  }

  return {
    paid: report?.paidTotal == null ? null : Number(report.paidTotal),
    pending: report?.pendingTotal == null ? null : Number(report.pendingTotal),
    averageRate: report?.averageRate,
    period: report?.period || "",
  };
};

export const CommissionsPage = ({ onNavigate, user }) => {
  const isBranch = user?.userType === "BRANCH";
  const [commissions, setCommissions] = useState([]);
  const [report, setReport] = useState({ paid: null, pending: null, averageRate: null, period: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCommission, setActiveCommission] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState("view");

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listResult, reportResult] = await Promise.allSettled([
        commissionService.getCommissions({ page: 1, limit: 100 }),
        commissionService.getCommissionsReport(),
      ]);
      if (listResult.status === "rejected") throw listResult.reason;
      const listResponse = listResult.value;
      const rows = unwrap(listResponse);
      if (!Array.isArray(rows)) throw new Error("The commissions response did not contain a data array.");
      setCommissions(rows);
      if (reportResult.status === "fulfilled") {
        setReport(getReportTotals(reportResult.value));
      } else {
        setReport({ paid: null, pending: null, averageRate: null, period: "" });
      }
    } catch (err) {
      setError(err?.message || "Failed to load commissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const openCommission = async (commission, mode = "view") => {
    setDetailMode(mode);
    setActiveCommission({ ...commission, loading: true });
    setDetailOpen(true);
    try {
      const response = await commissionService.getCommissionById(commission.id);
      setActiveCommission(unwrap(response));
    } catch (err) {
      setActiveCommission({ ...commission, error: err?.message || "Could not load commission details." });
    }
  };

  const cardValue = (value) => value == null || Number.isNaN(value) ? "—" : formatCurrency(value);

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <button type="button" className="hover:text-[#302d36]" onClick={() => onNavigate("/branch/dashboard")}>Home</button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Commissions</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#302d36] tracking-tight">Commissions</h1>
            {report.period && <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">{report.period}</span>}
          </div>
          <p className="text-xs text-[#716d78]">Review and manage commission records.</p>
        </div>
        {isBranch && <button type="button" onClick={() => setCreateOpen(true)} className="rounded-lg bg-[#7054a5] px-4 py-2.5 text-sm font-bold text-[#ffffff]">Add commission</button>}
      </div>

      {error && <p role="alert" className="rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] p-3 text-sm text-[#93000a]">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#f0eef3] shadow-xs">
          <span className="text-xs text-[#716d78] uppercase font-bold">Paid Total</span>
          <div className="text-2xl font-bold text-[#7054a5] mt-2 tabular-nums">{cardValue(report.paid)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#f0eef3] shadow-xs">
          <span className="text-xs text-[#716d78] uppercase font-bold">Pending Total</span>
          <div className="text-2xl font-bold text-[#ba1a1a] mt-2 tabular-nums">{cardValue(report.pending)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#f0eef3] shadow-xs">
          <span className="text-xs text-[#716d78] uppercase font-bold">Average Rate</span>
          <div className="text-2xl font-bold text-[#302d36] mt-2 tabular-nums">{report.averageRate == null ? "—" : `${report.averageRate}%`}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#f0eef3] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#f0eef3]">
                <th className="px-5 py-2">Policy Number</th>
                <th className="px-5 py-2">Client Entity</th>
                <th className="px-5 py-2 text-right">Commission Amount (₹)</th>
                <th className="px-5 py-2">Earned Date</th>
                <th className="px-5 py-2 text-center">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3]">
              {loading ? <tr><td colSpan={5} className="py-12 text-center text-[#827e89]">Loading commission records…</td></tr> : commissions.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-[#827e89]">No commission records returned.</td></tr> : commissions.map((commission) => (
                <tr key={commission.id} onClick={() => openCommission(commission)} title="View commission details" className="hover:bg-[#f7f6f8]/50 transition-colors h-14 cursor-pointer">
                  <td className="px-5 py-3 font-mono font-bold text-[#292631]">—</td>
                  <td className="px-5 py-3 font-semibold text-[#302d36]">—</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-[#302d36] text-sm tabular-nums">{commission.amount == null ? "—" : formatCurrency(commission.amount)}</td>
                  <td className="px-5 py-3 text-[#716d78]">{commission.earnedAt == null ? "—" : formatDate(commission.earnedAt)}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${commission.status === "PAID" ? "bg-[#7054a5] text-[#ffffff]" : "bg-[#cadeff] text-[#061c35]"}`}>{commission.status || "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCommissionDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchCommissions} />
      <CommissionDetailModal commission={activeCommission} isOpen={detailOpen} mode={detailMode} user={user} onStartEdit={() => setDetailMode("edit")} onClose={() => setDetailOpen(false)} onUpdated={fetchCommissions} />
    </div>
  );
};
