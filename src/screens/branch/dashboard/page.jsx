import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, Building2, CalendarClock,
  CircleDollarSign, FileText, RefreshCw, ShieldCheck, UserRoundSearch, Users, WalletCards,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { dashboardService } from "@/services/dashboard-service";
import { renewalService } from "@/services/renewal-service";
import { policyService } from "@/services/policy-service";

const metrics = [
  { key: "branches", label: "Branches", icon: Building2, adminOnly: true },
  { key: "staff", label: "Staff", icon: BadgeCheck },
  { key: "customers", label: "Customers", icon: Users },
  { key: "openLeads", label: "Open leads", icon: UserRoundSearch },
  { key: "policies", label: "Policies", icon: ShieldCheck },
  { key: "claims", label: "Claims", icon: FileText },
  { key: "openFollowUps", label: "Open follow-ups", icon: CalendarClock },
];

const dashboardDemoSummary = { monthlySales: 482500 };

function parseLocalDate(value) {
  if (!value) return null;
  const day = String(value).slice(0, 10);
  const date = new Date(`${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseLocalDate(value);
  return date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date) : "Date unavailable";
}

function getDaysRemaining(value) {
  const dueDate = parseLocalDate(value);
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((dueDate.getTime() - today.getTime()) / 86400000);
}

function formatDaysRemaining(days) {
  if (days === 0) return "Due today";
  if (days === 1) return "1 day remaining";
  if (days > 1) return `${days} days remaining`;
  if (days === -1) return "1 day overdue";
  return `${Math.abs(days)} days overdue`;
}

function getUpcomingRenewals(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => String(row?.status || "").toUpperCase() === "UPCOMING" && parseLocalDate(row?.dueDate))
    .sort((a, b) => parseLocalDate(a.dueDate) - parseLocalDate(b.dueDate));
}

export const DashboardPage = ({ onNavigate, user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renewalRows, setRenewalRows] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [renewalsLoading, setRenewalsLoading] = useState(true);
  const [renewalsError, setRenewalsError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await dashboardService.getDashboard();
      setData(response?.data ?? null);
    } catch (err) {
      setError(err?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRenewals = useCallback(async () => {
    setRenewalsLoading(true);
    setRenewalsError("");
    try {
      const [renewalsResult, policiesResult] = await Promise.allSettled([
        renewalService.getRenewals({ page: 1, limit: 100 }),
        policyService.getPolicies({ page: 1, limit: 100 }),
      ]);
      if (renewalsResult.status === "rejected") throw renewalsResult.reason;
      if (!Array.isArray(renewalsResult.value?.data)) throw new Error("Could not load upcoming renewals.");
      setRenewalRows(renewalsResult.value.data);
      setPolicies(policiesResult.status === "fulfilled" && Array.isArray(policiesResult.value?.data) ? policiesResult.value.data : []);
    } catch (err) {
      setRenewalRows([]);
      setPolicies([]);
      setRenewalsError(err?.message || "Could not load upcoming renewals.");
    } finally {
      setRenewalsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); fetchRenewals(); }, [fetchDashboard, fetchRenewals]);

  const formatCount = (value) => typeof value === "number" ? value.toLocaleString() : "—";
  const formatAmount = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    const amount = Number(value);
    return Number.isFinite(amount) ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount) : String(value);
  };
  const availableMetrics = metrics.filter(({ adminOnly }) => !adminOnly || user?.userType === "ADMIN");
  const countMetrics = [
    ...availableMetrics.map((metric) => ({ ...metric, value: formatCount(data?.[metric.key]) })),
    { key: "pendingCommissions", label: "Pending commissions", icon: CircleDollarSign, value: formatAmount(data?.commissionsPendingAmount) },
  ];
  const countRows = Array.from({ length: Math.ceil(countMetrics.length / 4) }, (_, index) => countMetrics.slice(index * 4, index * 4 + 4));
  const upcomingRenewals = useMemo(() => getUpcomingRenewals(renewalRows), [renewalRows]);
  const policiesById = useMemo(() => new Map(policies.filter((policy) => policy?.id).map((policy) => [String(policy.id), policy])), [policies]);

  const handleRefresh = () => { fetchDashboard(); fetchRenewals(); };
  const retryRenewals = () => fetchRenewals();

  return <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">


    {error && <div role="alert" className="rounded-md border border-[#efd5d4] bg-[#fff8f7] px-3.5 py-3 text-[12px] text-[#a13e3a]">{error}</div>}

    <section aria-label="Dashboard metrics" aria-busy={loading} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {countRows.map((row, rowIndex) => <div key={`metric-row-${rowIndex}`} className="col-span-full grid grid-cols-1 gap-2 rounded-lg border border-[#e9e7ec] bg-[#f1edf5] p-2.5 shadow-[0_1px_3px_rgba(34,26,45,0.035)] sm:grid-cols-2 xl:grid-cols-4">
        {row.map(({ key, label, icon: Icon, value }) => <article key={key} className="flex min-h-[54px] min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#8064aa]"><Icon aria-hidden="true" size={15} strokeWidth={1.8} /></span>
          <div className="min-w-0"><h2 className="truncate text-[10px] font-medium leading-4 text-[#625d69]">{label}</h2>{loading ? <Skeleton className="mt-0.5 h-4 w-12" /> : <p className="truncate text-[17px] font-semibold leading-5 tracking-[-0.025em] tabular-nums text-[#302d36]">{value}</p>}</div>
        </article>)}
      </div>)}
    </section>

    <section aria-label="Renewal overview" className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
   

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="flex items-center justify-between gap-3"><div><h2 className="text-[14px] font-semibold text-[#393640]">Upcoming renewals</h2><p className="mt-1 text-[11px] text-[#77737e]">Next policies due</p></div><a href="/branch/renewals" onClick={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigate("/branch/renewals"); } }} className="shrink-0 rounded-sm text-[11px] font-medium text-[#7054a5] hover:text-[#574078] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7054a5]">View all</a></CardHeader>
        <div className="divide-y divide-[#efedf1] px-4">
          {renewalsLoading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="flex min-h-[62px] items-center justify-between gap-3"><div className="space-y-2"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-28" /></div><Skeleton className="h-5 w-16 rounded-full" /></div>)
            : renewalsError ? <div role="alert" className="flex min-h-[248px] flex-col items-center justify-center px-4 text-center"><p className="text-[12px] text-[#a13e3a]">{renewalsError}</p><button type="button" onClick={retryRenewals} className="mt-2 text-[11px] font-medium text-[#7054a5] underline-offset-2 hover:underline">Try again</button></div>
              : upcomingRenewals.length ? upcomingRenewals.slice(0, 4).map((renewal, index) => {
                const policy = policiesById.get(String(renewal.policyId));
                const daysRemaining = getDaysRemaining(renewal.dueDate);
                const statusVariant = daysRemaining < 0 ? "overdue" : daysRemaining === 0 ? "due" : "upcoming";
                return <div key={`${renewal.id || renewal.policyId || "renewal"}-${index}`} className="flex min-h-[62px] items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[#393640]">{policy?.policyNumber || "Policy renewal"}</p><p className="mt-1 truncate text-[10px] text-[#77737e]">Due {formatDate(renewal.dueDate)} <span className="px-0.5 text-[#c1bdc6]">·</span> {formatDaysRemaining(daysRemaining)}</p></div>
                  <Badge variant={statusVariant} className="shrink-0">{String(renewal.status || "Upcoming").toLowerCase() === "upcoming" ? "Upcoming" : renewal.status}</Badge>
                </div>;
              })
                : <Empty icon={CalendarClock} title="No upcoming renewals" description="There are no upcoming policy renewals to show." className="min-h-[248px]" />}
        </div>
      </Card>
    </section>

  </div>;
};
