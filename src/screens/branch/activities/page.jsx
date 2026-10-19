import { useCallback, useEffect, useState } from "react";
import { activityService } from "@/services/activity-service";

const getRows = (response) => Array.isArray(response?.data) ? response.data : [];

const formatActivityType = (type) => {
  if (!type) return "—";
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const ActivitiesPage = ({ onNavigate }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await activityService.getActivities();
      setActivities(getRows(response));
    } catch (error) {
      setErrorMessage(error.message || "Could not load activities.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const openDetails = async (activity) => {
    setSelectedActivity(activity);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await activityService.getActivityById(activity.id);
      const record = Array.isArray(response?.data)
        ? response.data.find((item) => item.id === activity.id) || response.data[0]
        : response?.data || response;
      setDetail(record);
    } catch (error) {
      setErrorMessage(error.message || "Could not load activity details.");
      setSelectedActivity(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="px-4 py-5 lg:px-8 flex flex-col gap-4 w-full max-w-[1500px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[#716d78] text-[11px] uppercase tracking-wider font-semibold">
            <button type="button" className="hover:text-[#302d36]" onClick={() => onNavigate("/branch/dashboard")}>Home</button>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#302d36] font-bold">Activities</span>
          </div>
          <h1 className="text-2xl font-bold text-[#302d36] tracking-tight mt-1">Activities</h1>
          <p className="text-xs text-[#716d78]">Review recent changes across customer records.</p>
        </div>
        <button type="button" onClick={loadActivities} disabled={loading} className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#7054a5] text-[#ffffff] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>{loading ? "Refreshing…" : "Refresh"}</span>
        </button>
      </div>

      {errorMessage && <div role="alert" className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-sm">{errorMessage}</div>}

      <section className="bg-white rounded-xl border border-[#f0eef3] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f0eef3] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#302d36]">Activity history</h2>
          {!loading && <span className="text-xs text-[#827e89]">{activities.length} records</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f6f8]/70 text-[#716d78] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#f0eef3]">
                <th className="px-5 py-2">Activity</th>
                <th className="px-5 py-2">Related record</th>
                <th className="px-5 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eef3]">
              {loading ? (
                <tr><td colSpan={3} className="py-12 text-center text-[#827e89]">Loading activities...</td></tr>
              ) : activities.length === 0 ? (
                <tr><td colSpan={3} className="py-12 text-center text-[#827e89]">No activities returned.</td></tr>
              ) : activities.map((activity, index) => (
                <tr key={activity.id || `${activity.type}-${index}`} className="hover:bg-[#f7f6f8]/50 transition-colors h-14">
                  <td className="px-5 py-3 font-semibold text-[#302d36]">{formatActivityType(activity.type)}</td>
                  <td className="px-5 py-3 text-[#716d78]">{activity.customerId ? "Customer activity" : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" onClick={() => openDetails(activity)} disabled={!activity.id} className="px-2.5 py-1 rounded bg-[#f7f6f8] border border-[#e7e4eb] hover:bg-[#ebe5f4] text-[11px] font-bold text-[#302d36] disabled:opacity-50">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2c35]/60 backdrop-blur-xs p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedActivity(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="activity-details-title" className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl border border-[#f0eef3]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eef3]">
              <h2 id="activity-details-title" className="text-base font-bold text-[#302d36]">Activity details</h2>
              <button type="button" onClick={() => setSelectedActivity(null)} aria-label="Close activity details"><span className="material-symbols-outlined">close</span></button>
            </div>
            {detailLoading ? (
              <p className="py-6 text-sm text-[#827e89]">Loading details...</p>
            ) : (
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="font-semibold text-[#716d78]">Activity</dt>
                <dd className="text-[#302d36]">{formatActivityType(detail?.type || selectedActivity.type)}</dd>
                {(detail?.customerId || selectedActivity.customerId) && (
                  <>
                    <dt className="font-semibold text-[#716d78]">Related record</dt>
                    <dd className="text-[#302d36]">Customer</dd>
                  </>
                )}
              </dl>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
