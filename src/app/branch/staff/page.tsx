import React, { useState, useEffect } from 'react';
import { Staff } from '@/types/crm';
import { staffService, CreateStaffInput } from '@/services/staff-service';
import { getInitials, formatDate } from '@/lib/utils';

interface StaffPageProps {
  onNavigate: (path: string) => void;
}

export const StaffPage: React.FC<StaffPageProps> = ({ onNavigate }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState<CreateStaffInput>({
    name: '',
    phone: '',
    email: '',
    designation: 'Insurance Broker',
    status: 'ACTIVE',
  });

  const fetchStaff = () => {
    setLoading(true);
    staffService
      .getStaff()
      .then((res) => setStaff(res.data))
      .catch((err) => console.error('Failed to load staff:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;
    try {
      setSubmitting(true);
      await staffService.createStaff(newStaff);
      setModalOpen(false);
      setNewStaff({ name: '', phone: '', email: '', designation: 'Insurance Broker', status: 'ACTIVE' });
      fetchStaff();
    } catch {
      alert('Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff record?')) {
      await staffService.deleteStaff(id);
      fetchStaff();
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
            <span className="text-[#0f1c2e] font-bold">Staff Management</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Branch Staff & Brokers Roster</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {staff.length} Active Personnel
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Manage underwriter assignments, claims adjusters, and broker credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>+ Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Name & Identity</th>
                <th className="px-5 py-2">Designation / Role</th>
                <th className="px-5 py-2">Phone Number</th>
                <th className="px-5 py-2">Corporate Email</th>
                <th className="px-5 py-2">Joining Date</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#17263f] text-white flex items-center justify-center font-bold">
                          {getInitials(s.name)}
                        </div>
                        <span className="font-bold text-[#0f1c2e] text-[13px]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-[#0f1c2e]">{s.designation}</td>
                    <td className="px-5 py-3 font-mono text-[#0f1c2e]">{s.phone}</td>
                    <td className="px-5 py-3 text-[#44474d]">{s.email || '—'}</td>
                    <td className="px-5 py-3 text-[#44474d]">{formatDate(s.joiningDate || s.createdAt)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002c26]/10 text-[#002c26]">
                        {s.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6]"
                        title="Delete Staff"
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

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#e6eeff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
              <h3 className="text-base font-bold text-[#0f1c2e]">Add Staff Personnel</h3>
              <button onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Julian Thorne"
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Phone *</label>
                <input
                  type="tel"
                  required
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Email</label>
                <input
                  type="email"
                  value={newStaff.email || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="staff@unitedins.com"
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold">Designation</label>
                <input
                  type="text"
                  value={newStaff.designation || ''}
                  onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                  placeholder="e.g. Claims Specialist"
                  className="h-9 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs"
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#eff3ff] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#002c26] text-[#93f4e3] text-xs font-bold"
                >
                  {submitting ? 'Saving...' : 'Add Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
