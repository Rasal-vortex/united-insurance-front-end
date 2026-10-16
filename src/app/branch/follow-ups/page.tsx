import React, { useState, useEffect } from 'react';
import { FollowUp } from '@/types/crm';
import { followUpService } from '@/services/followup-service';
import { formatDate } from '@/lib/utils';
import { CreateFollowUpDialog } from '@/components/dialogs/create-followup-dialog';

interface FollowUpsPageProps {
  onNavigate: (path: string) => void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({ onNavigate }) => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFollowUps = () => {
    setLoading(true);
    followUpService
      .getFollowUps()
      .then((res) => setFollowUps(res.data))
      .catch((err) => console.error('Failed to load follow-ups:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleToggleComplete = async (f: FollowUp) => {
    const nextStatus = f.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await followUpService.updateFollowUp(f.id, {
      status: nextStatus,
      completedAt: nextStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
    fetchFollowUps();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this follow-up reminder?')) {
      await followUpService.deleteFollowUp(id);
      fetchFollowUps();
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
            <span className="text-[#0f1c2e] font-bold">Follow-ups</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Follow-ups & Task Reminders</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {followUps.length} Actions Queued
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Underwriting tasks, prospect callback agendas, and claim investigation milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          <span>+ Schedule Follow-up</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2 w-10">Done</th>
                <th className="px-5 py-2">Action Title</th>
                <th className="px-5 py-2">Associated Contact</th>
                <th className="px-5 py-2">Assigned Adjuster/Broker</th>
                <th className="px-5 py-2">Due Date</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    Loading follow-ups...
                  </td>
                </tr>
              ) : (
                followUps.map((f) => (
                  <tr key={f.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={f.status === 'COMPLETED'}
                        onChange={() => handleToggleComplete(f)}
                        className="w-4 h-4 rounded text-[#002c26] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className={`font-bold text-sm ${f.status === 'COMPLETED' ? 'line-through text-[#75777e]' : 'text-[#0f1c2e]'}`}>
                          {f.title}
                        </span>
                        {f.notes && <span className="text-[11px] text-[#44474d] mt-0.5">{f.notes}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0f1c2e]">
                      {f.customerName || f.leadName || 'General Account'}
                    </td>
                    <td className="px-5 py-3 text-[#44474d]">{f.staffName || 'Marcus Sterling'}</td>
                    <td className="px-5 py-3 font-semibold text-[#0f1c2e]">{formatDate(f.dueAt)}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          f.status === 'COMPLETED'
                            ? 'bg-[#002c26] text-[#93f4e3]'
                            : 'bg-[#cadeff] text-[#061c35]'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6]"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateFollowUpDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchFollowUps}
      />
    </div>
  );
};
