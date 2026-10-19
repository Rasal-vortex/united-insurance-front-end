import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/services/dashboard-service";

const summaryMetrics = [
  { key: "grossWrittenPremium", label: "Gross written premium" },
  { key: "claimPayoutTotal", label: "Claim payout total" },
  { key: "activePoliciesCount", label: "Active policies" },
  { key: "claimsCount", label: "Claims" },
  { key: "conversionRate", label: "Conversion rate", format: "percent" },
  { key: "lapseRate", label: "Lapse rate", format: "percent" },
];

const displayValue = (value, format) => {
  if (typeof value !== "number") return "—";
  return format === "percent" ? `${value}%` : value.toLocaleString();
};

const getPayload = (response) => response?.data ?? response ?? null;

export const ReportsPage = ({ onNavigate }) => {
  const [summary, setSummary] = useState(null);
  const [renewalReport, setRenewalReport] = useState(null);
  const [commissionReport, setCommissionReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryResponse, renewalsResponse, commissionsResponse] = await Promise.all([
        dashboardService.getReportsSummary(),
        dashboardService.getReportsRenewals(),
        dashboardService.getReportsCommissions(),
      ]);
      setSummary(getPayload(summaryResponse));
      setRenewalReport(getPayload(renewalsResponse));
      setCommissionReport(getPayload(commissionsResponse));
    } catch (err) {
      setError(err?.message || "Could not load report data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-5 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#716d78]">
            <button type="button" onClick={() => onNavigate("/admin/branches")} className="hover:text-[#302d36]">Administration</button>
            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="font-bold text-[#302d36]">Reports</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#302d36]">Reports</h1>
          <p className="mt-1 text-xs text-[#716d78]">{summary?.period ? `${summary.period} · ` : ""}View summary, renewal, and commission figures.</p>
        </div>
        <button type="button" onClick={fetchReports} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg bg-[#7054a5] px-4 py-2 text-xs font-bold text-[#ffffff] transition-opacity hover:opacity-90 disabled:opacity-60 sm:self-auto">
          <span aria-hidden="true" className="material-symbols-outlined text-base">refresh</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && <div role="alert" className="rounded-lg border border-[#ffdad6] bg-[#fff4f2] p-4 text-sm text-[#93000a]">{error}</div>}

      <section aria-label="Summary report" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryMetrics.map(({ key, label, format }) => (
          <article key={key} className="rounded-xl border border-[#f0eef3] bg-white p-5 shadow-xs">
            <h2 className="text-xs font-bold uppercase text-[#716d78]">{label}</h2>
            <p className="mt-2 text-3xl font-bold tabular-nums text-[#302d36]">{loading ? "..." : displayValue(summary?.[key], format)}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-[#f0eef3] bg-white shadow-xs">
        <div className="border-b border-[#f0eef3] p-4">
          <h2 className="text-sm font-bold text-[#302d36]">Branch performance</h2>
          <p className="mt-1 text-[11px] text-[#716d78]">Policy and claim activity across branches.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead><tr className="h-10 border-b border-[#f0eef3] bg-[#f7f6f8]/70 text-[11px] font-bold uppercase tracking-wider text-[#716d78]">
              <th scope="col" className="px-5 py-2">Branch</th><th scope="col" className="px-5 py-2">Code</th><th scope="col" className="px-5 py-2 text-right">Active policies</th><th scope="col" className="px-5 py-2 text-right">GWP</th><th scope="col" className="px-5 py-2 text-right">Claims</th>
            </tr></thead>
            <tbody className="divide-y divide-[#f0eef3]">
              {loading ? <tr><td colSpan={5} className="py-8 text-center text-[#827e89]">Loading branch performance...</td></tr> : Array.isArray(summary?.branchesPerformance) && summary.branchesPerformance.length ? summary.branchesPerformance.map((branch, index) => (
                <tr key={`${branch.code ?? "branch"}-${index}`} className="h-12 hover:bg-[#f7f6f8]/50">
                  <td className="px-5 py-3 font-semibold text-[#302d36]">{branch.branchName ?? "—"}</td><td className="px-5 py-3 font-mono text-[#292631]">{branch.code ?? "—"}</td><td className="px-5 py-3 text-right font-bold tabular-nums text-[#302d36]">{displayValue(branch.activePolicies)}</td><td className="px-5 py-3 text-right font-mono font-bold tabular-nums text-[#302d36]">{displayValue(branch.gwp)}</td><td className="px-5 py-3 text-right font-bold tabular-nums text-[#302d36]">{displayValue(branch.claims)}</td>
                </tr>
              )) : <tr><td colSpan={5} className="py-8 text-center text-[#827e89]">No branch performance rows returned.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ReportMetrics title="Renewals" period={renewalReport?.period} loading={loading} data={renewalReport} metrics={[
          { key: "upcomingCount", label: "Upcoming renewals" },
          { key: "renewalRate", label: "Renewal rate", format: "percent" },
          { key: "projectedVolume", label: "Projected volume" },
        ]} />
        <ReportMetrics title="Commissions" period={commissionReport?.period} loading={loading} data={commissionReport} metrics={[
          { key: "paidTotal", label: "Paid total" },
          { key: "pendingTotal", label: "Pending total" },
          { key: "averageRate", label: "Average rate", format: "percent" },
        ]} />
      </section>
    </div>
  );
};

function ReportMetrics({ title, period, loading, data, metrics }) {
  return (
    <section className="rounded-xl border border-[#f0eef3] bg-white p-5 shadow-xs">
      <div className="mb-4 border-b border-[#f0eef3] pb-3">
        <h2 className="text-sm font-bold text-[#302d36]">{title}</h2>
        <p className="mt-1 text-[11px] text-[#716d78]">{period ?? "—"}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {metrics.map(({ key, label, format }) => (
          <div key={key} className="rounded-lg bg-[#f7f6f8]/70 p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#716d78]">{label}</h3>
            <p className="mt-2 text-xl font-bold tabular-nums text-[#302d36]">{loading ? "..." : displayValue(data?.[key], format)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
