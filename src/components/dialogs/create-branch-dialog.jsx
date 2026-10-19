import { useState } from "react";
import { branchService } from "@/services/branch-service";

export const CreateBranchDialog = ({ isOpen, onClose, onCreated }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    address: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMessage("Branch Name and Branch Code are required");
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
    } catch (err) {
      setErrorMessage(err.message || "Failed to provision branch");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#292631]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden border-l border-[#f0eef3]">

        {/* Header */}
        <div className="px-6 py-4 bg-[#f7f6f8] flex items-start justify-between border-b border-[#e7e4eb]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7054a5] text-xl">add_business</span>
              <h2 className="text-[18px] font-bold text-[#2f2c35]">Create New Branch</h2>
            </div>
            <p className="text-[13px] text-[#716d78] mt-0.5">
              Provision branch code, operational credentials, and location details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#716d78] hover:bg-[#e7e4eb] hover:text-[#302d36] transition-colors"
            title="Close Panel"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1 */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#716d78] font-bold">1. Entity Identification</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#302d36] font-semibold flex items-center justify-between">
                  <span>Branch Name <span className="text-[#ba1a1a]">*</span></span>
                  <span className="text-[11px] text-[#827e89] font-normal">Official Legal Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={update("name")}
                  placeholder="e.g., Atlanta Midtown Branch"
                  required
                  className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg text-sm text-[#302d36] placeholder:text-[#827e89] focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#302d36] font-semibold flex items-center justify-between">
                  <span>Branch Code <span className="text-[#ba1a1a]">*</span></span>
                  <span className="text-[11px] text-[#827e89] font-normal">BR-XXX-##</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={update("code")}
                  placeholder="e.g., BR-ATL-05"
                  required
                  className="h-10 px-3 bg-[#f7f6f8] border border-[#e7e4eb] rounded-lg font-mono text-sm text-[#302d36] placeholder:text-[#827e89] uppercase focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#f0eef3]" />

          {/* Section 2 */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#716d78] font-bold">2. Provision Manager Access</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#302d36] font-semibold">
                  Username <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#827e89] text-base pointer-events-none">person</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={update("username")}
                    placeholder="e.g., atlanta_admin"
                    required
                    className="w-full h-10 pl-8 pr-3 bg-[#f7f6f8] border border-[#e7e4eb] text-[#302d36] placeholder:text-[#827e89] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#302d36] font-semibold">
                  Temporary Password <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#827e89] text-base pointer-events-none">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={update("password")}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-10 pl-8 pr-10 bg-[#f7f6f8] border border-[#e7e4eb] text-[#302d36] placeholder:text-[#827e89] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-[#716d78] hover:text-[#2f2c35] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-[#716d78]">
              Manager will be prompted to reset password and configure multi-factor auth upon initial log in.
            </span>
          </div>

          <div className="h-px bg-[#f0eef3]" />

          {/* Section 3 */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#716d78] font-bold">3. Contact &amp; Physical Jurisdiction</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#302d36] font-semibold">
                  Phone Number <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#827e89] text-base pointer-events-none">call</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={update("phone")}
                    placeholder="e.g., +1 (404) 555-0199"
                    required
                    className="w-full h-10 pl-8 pr-3 bg-[#f7f6f8] border border-[#e7e4eb] text-[#302d36] placeholder:text-[#827e89] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#302d36] font-semibold">
                  Dispatch Email <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-2.5 text-[#827e89] text-base pointer-events-none">mail</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={update("email")}
                    placeholder="e.g., atlanta@unitedins.com"
                    required
                    className="w-full h-10 pl-8 pr-3 bg-[#f7f6f8] border border-[#e7e4eb] text-[#302d36] placeholder:text-[#827e89] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs text-[#302d36] font-semibold">
                  Physical Office Address <span className="text-[#ba1a1a]">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={update("address")}
                  placeholder="Street address, suite/floor, city, state, zip code..."
                  rows={2}
                  required
                  className="p-3 bg-[#f7f6f8] border border-[#e7e4eb] text-[#302d36] placeholder:text-[#827e89] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7054a5]/30 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#f7f6f8] border-t border-[#e7e4eb] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-[#e7e4eb] text-[#302d36] text-xs font-semibold hover:bg-[#f0eef3] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#7054a5] text-[#ffffff] hover:opacity-95 text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">
              {submitting ? "sync" : "check_circle"}
            </span>
            <span>{submitting ? "Provisioning..." : "Create Branch"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
