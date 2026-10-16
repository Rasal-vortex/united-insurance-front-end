import React from 'react';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
      <div>
        <div className="flex items-center gap-1 text-[#44474d] text-[11px] uppercase tracking-wider font-semibold">
          <span className="hover:text-[#0f1c2e] cursor-pointer" onClick={() => onNavigate('/branch/dashboard')}>
            Home
          </span>
          <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          <span className="text-[#0f1c2e] font-bold">Help & Support</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0f1c2e] tracking-tight mt-1">Enterprise Operator Documentation</h1>
        <p className="text-xs text-[#44474d]">
          Operational handbook for underwriters, adjusters, and branch directors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e6eeff] shadow-xs">
          <div className="flex items-center gap-2 text-[#021129]">
            <span className="material-symbols-outlined text-[#002c26]">verified_user</span>
            <h2 className="text-sm font-bold">Policy Lifecycle Workflow</h2>
          </div>
          <p className="text-xs text-[#44474d] mt-2 leading-relaxed">
            Policy creation triggers automatic renewal schedule generation and real-time ledger audit entries. Use the Policies tab to filter by underwriter and monitor 30-day expiration urgency.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e6eeff] shadow-xs">
          <div className="flex items-center gap-2 text-[#021129]">
            <span className="material-symbols-outlined text-[#002c26]">health_and_safety</span>
            <h2 className="text-sm font-bold">Claims Adjudication Tiers</h2>
          </div>
          <p className="text-xs text-[#44474d] mt-2 leading-relaxed">
            FastTrack claims (Tier 1) are approved within 24–48 hours upon deductible confirmation. Higher tiers require lead adjuster appraisal before wire disbursement authorization.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e6eeff] shadow-xs">
          <div className="flex items-center gap-2 text-[#021129]">
            <span className="material-symbols-outlined text-[#002c26]">corporate_fare</span>
            <h2 className="text-sm font-bold">Branch Provisioning (Admin Only)</h2>
          </div>
          <p className="text-xs text-[#44474d] mt-2 leading-relaxed">
            Only authenticated Administrators can provision new branch entities via POST /api/branches. Branch managers must subsequently authenticate individually with their issued credentials.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e6eeff] shadow-xs">
          <div className="flex items-center gap-2 text-[#021129]">
            <span className="material-symbols-outlined text-[#002c26]">folder_open</span>
            <h2 className="text-sm font-bold">Document Vault Governance</h2>
          </div>
          <p className="text-xs text-[#44474d] mt-2 leading-relaxed">
            All document uploads accept PDF, PNG, and JPEG files up to 5 MB and must be linked to a customer, policy, or claim. Content is streamed securely via authenticated endpoints.
          </p>
        </div>
      </div>
    </div>
  );
};
