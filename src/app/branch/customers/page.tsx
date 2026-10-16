import React, { useState, useEffect } from 'react';
import { Customer } from '@/types/crm';
import { customerService } from '@/services/customer-service';
import { getInitials } from '@/lib/utils';
import { CreateCustomerDialog } from '@/components/dialogs/create-customer-dialog';

interface CustomersPageProps {
  onNavigate: (path: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    customerService
      .getCustomers({ search })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Failed to load customers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await customerService.deleteCustomer(id);
      setDeleteConfirmId(null);
      fetchCustomers();
    } catch {
      alert('Failed to delete customer record');
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
            <span className="text-[#0f1c2e] font-bold">Customers</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight">Customer Relationship Management</h1>
            <span className="bg-[#cadeff] text-[#061c35] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-xs text-[#44474d]">
            Directory of insured policyholders, coverage histories, and contact records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e6eeff] shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#75777e] text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, CUST ID, phone, email..."
            className="w-full pl-9 pr-3 py-2 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs text-[#0f1c2e] focus:outline-none focus:bg-white"
          />
        </div>
        <button
          type="button"
          onClick={fetchCustomers}
          className="px-3 py-2 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-xs font-medium text-[#0f1c2e] hover:bg-[#dde9ff]"
        >
          Refresh Directory
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-[#e6eeff] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff3ff]/70 text-[#44474d] text-[11px] font-bold uppercase tracking-wider h-10 border-b border-[#e6eeff]">
                <th className="px-5 py-2">Customer Entity</th>
                <th className="px-5 py-2">CUST ID</th>
                <th className="px-5 py-2">Phone & Contact</th>
                <th className="px-5 py-2">Physical Address</th>
                <th className="px-5 py-2">Assigned Staff</th>
                <th className="px-5 py-2 text-center">Status</th>
                <th className="px-5 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6eeff]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#75777e]">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#eff3ff]/50 transition-colors h-14">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#cadeff] text-[#061c35] flex items-center justify-center font-bold">
                          {getInitials(c.name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0f1c2e] text-[13px]">{c.name}</span>
                          <span className="text-[11px] text-[#75777e]">{c.email || 'No email registered'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-[#17263f]">{c.customerNumber}</td>
                    <td className="px-5 py-3 text-[#0f1c2e] font-medium">{c.phone}</td>
                    <td className="px-5 py-3 text-[#44474d] max-w-xs truncate">{c.address || '—'}</td>
                    <td className="px-5 py-3 text-[#0f1c2e]">{c.assignedStaffName || 'Marcus Sterling'}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#002c26]/10 text-[#002c26]">
                        {c.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onNavigate('/branch/policies')}
                          title="View Policies"
                          className="p-1.5 rounded hover:bg-[#eff3ff] text-[#44474d]"
                        >
                          <span className="material-symbols-outlined text-base">policy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(c.id)}
                          title="Delete Customer"
                          className="p-1.5 rounded hover:bg-[#ffdad6] text-[#ba1a1a]"
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#021129]/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#e6eeff]">
            <h3 className="text-base font-bold text-[#ba1a1a] flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              <span>Confirm Customer Deletion</span>
            </h3>
            <p className="text-xs text-[#44474d] mt-2">
              Are you sure you want to delete this customer record? Associated policies will remain in underwriter records.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-[#eff3ff] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateCustomerDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchCustomers}
      />
    </div>
  );
};
