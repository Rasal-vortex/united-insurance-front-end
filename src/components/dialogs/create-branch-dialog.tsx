import React, { useState } from 'react';
import { branchService, CreateBranchInput } from '@/services/branch-service';

interface CreateBranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateBranchDialog: React.FC<CreateBranchDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateBranchInput>({
    name: '',
    code: '',
    region: 'Northeast Division (NYC)',
    territory: 'Eastern District',
    username: '',
    password: '',
    phone: '',
    email: '',
    address: '',
    active: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage('Branch Name and Branch Code are required');
      return;
    }

    try {
      setSubmitting(true);
      await branchService.createBranch({
        ...formData,
        code: formData.code.toUpperCase(),
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to provision branch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#17263f]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Slide-over Drawer */}
      <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden border-l border-[#e6eeff]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eff3ff] flex items-start justify-between border-b border-[#d6e3fc]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#002c26] text-xl">add_business</span>
              <h2 className="text-[18px] font-bold text-[#021129]">Create New Branch</h2>
            </div>
            <p className="text-[13px] text-[#44474d] mt-0.5">
              Provision branch code, operational credentials, and location details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#44474d] hover:bg-[#d6e3fc] hover:text-[#0f1c2e] transition-colors"
            title="Close Panel"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Backend Endpoint Tag */}
        <div className="px-6 py-2 bg-[#e6eeff] flex items-center justify-between text-[11px] text-[#44474d] border-b border-[#d6e3fc]">
          <span className="flex items-center gap-1 font-mono">
            <span className="bg-[#021129] text-white px-1.5 py-0.2 rounded text-[10px] font-bold">POST</span>
            <span>/api/branches</span>
          </span>
          <span className="flex items-center gap-1 text-[#061c35] font-semibold">
            <span className="material-symbols-outlined text-xs">verified_user</span>
            <span>Requires ADMIN role authorization</span>
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Entity Identification */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#44474d] font-bold">
              1. Entity Identification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Branch Name */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#0f1c2e] font-semibold flex items-center justify-between">
                  <span>Branch Name <span className="text-[#ba1a1a]">*</span></span>
                  <span className="text-[11px] text-[#75777e] font-normal">Official Legal Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Atlanta Midtown Branch"
                  className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] placeholder:text-[#75777e] focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Branch Code */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold flex items-center justify-between">
                  <span>Branch Code <span className="text-[#ba1a1a]">*</span></span>
                  <span className="text-[11px] text-[#75777e] font-normal">BR-XXX-##</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., BR-ATL-05"
                  className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg font-mono text-sm text-[#0f1c2e] placeholder:text-[#75777e] uppercase focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Territory Assignment */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Territory Assignment
                </label>
                <select
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  className="h-10 px-3 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-sm text-[#0f1c2e] focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white"
                >
                  <option value="Southeast Division (ATL)">Southeast Division (ATL)</option>
                  <option value="Northeast Division (NYC)">Northeast Division (NYC)</option>
                  <option value="Midwest Division (CHI)">Midwest Division (CHI)</option>
                  <option value="Pacific Division (SFO)">Pacific Division (SFO)</option>
                  <option value="Southwest Division (DAL)">Southwest Division (DAL)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#e6eeff]"></div>

          {/* 2. Provision Manager Access */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#44474d] font-bold">
              2. Provision Manager Access
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Username <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#75777e] text-base pointer-events-none">
                    person
                  </span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g., atlanta_admin"
                    className="w-full h-10 pl-8 pr-3 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Temporary Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Temporary Password <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#75777e] text-base pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-8 pr-10 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-[#44474d] hover:text-[#021129] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-[#44474d]">
              Manager will be prompted to reset password and configure multi-factor auth upon initial log in.
            </span>
          </div>

          <div className="h-px bg-[#e6eeff]"></div>

          {/* 3. Contact & Physical Jurisdiction */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#44474d] font-bold">
              3. Contact & Physical Jurisdiction
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Phone Number <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#75777e] text-base pointer-events-none">
                    call
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +1 (404) 555-0199"
                    className="w-full h-10 pl-8 pr-3 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Dispatch Email <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#75777e] text-base pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., atlanta@unitedins.com"
                    className="w-full h-10 pl-8 pr-3 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#0f1c2e] font-semibold">
                  Physical Office Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, suite/floor, city, state, zip code..."
                  rows={2}
                  className="p-3 bg-[#eff3ff] border border-[#d6e3fc] text-[#0f1c2e] placeholder:text-[#75777e] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002c26]/30 focus:bg-white transition-all resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Initial Status Checkbox */}
          <div className="bg-[#eff3ff] p-3 rounded-lg flex items-center gap-2 mt-1 border border-[#d6e3fc]">
            <input
              type="checkbox"
              id="initialActiveCheckbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded text-[#002c26] focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="initialActiveCheckbox"
              className="text-xs text-[#0f1c2e] font-medium cursor-pointer select-none"
            >
              Activate operational underwriting permissions immediately upon provisioning
            </label>
          </div>
        </form>

        {/* Modal Actions Bar */}
        <div className="px-6 py-4 bg-[#eff3ff] border-t border-[#d6e3fc] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#d6e3fc] text-[#0f1c2e] text-xs font-semibold hover:bg-[#e6eeff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#002c26] text-[#93f4e3] hover:opacity-95 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {submitting ? 'sync' : 'check_circle'}
            </span>
            <span>{submitting ? 'Provisioning...' : 'Create Branch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
