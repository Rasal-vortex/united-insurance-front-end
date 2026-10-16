import React, { useState, useEffect } from 'react';
import { Lead } from '@/types/crm';
import { leadService } from '@/services/lead-service';
import { formatDate } from '@/lib/utils';
import { CreateLeadDialog } from '@/components/dialogs/create-lead-dialog';

interface LeadsPageProps {
  onNavigate: (path: string) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ onNavigate }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    leadService
      .getLeads({
        search,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
      .then((res) => setLeads(res.data))
      .catch((err) => console.error('Failed to load leads:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  const handleConvert = async (id: string) => {
    try {
      setConvertingId(id);
      await leadService.convertLead(id);
      fetchLeads();
    } catch {
      alert('Failed to convert lead to customer');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lead record?')) {
      await leadService.deleteLead(id);
      fetchLeads();
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
            <span className="text-[#0f1c2e] font-bold">Leads</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Prospect Leads Pipeline</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {leads.length} Inbound Prospects
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Inbound prospect pipeline with stage progression, underwriting interest, and conversion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e6eeff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#eff3ff] p-1 rounded-lg">
          {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                statusFilter === st ? 'bg-white text-[#0f1c2e] shadow-xs' : 'text-[#44474d] hover:text-[#0f1c2e]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2 text-[#75777e] text-base">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prospects..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs text-[#0f1c2e] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Lead Name</th>
                <th className="px-5 py-2">Contact Details</th>
                <th className="px-5 py-2">Product Interest</th>
                <th className="px-5 py-2">Source</th>
                <th className="px-5 py-2">Next Follow-up</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    Loading prospect pipeline...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3 font-bold text-[#0f1c2e] text-[13px]">{l.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#0f1c2e]">{l.phone}</span>
                        <span className="text-[11px] text-[#75777e]">{l.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-[#0f1c2e]">{l.interest || 'General'}</td>
                    <td className="px-5 py-3 text-[#44474d]">{l.source || 'Direct'}</td>
                    <td className="px-5 py-3 text-[#44474d]">{formatDate(l.nextFollowUpAt || '')}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#cadeff] text-[#061c35]">
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.status !== 'CONVERTED' && (
                          <button
                            type="button"
                            onClick={() => handleConvert(l.id)}
                            disabled={convertingId === l.id}
                            title="Convert to Customer"
                            className="px-2.5 py-1 rounded bg-[#002c26] text-[#93f4e3] hover:opacity-90 font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-xs">how_to_reg</span>
                            <span>{convertingId === l.id ? 'Converting...' : 'Convert'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id)}
                          className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6]"
                          title="Delete Lead"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateLeadDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchLeads}
      />
    </div>
  );
};
