import React from 'react';
import { AuthUser } from '@/types/auth';

interface AppSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentPath,
  onNavigate,
  user,
  onLogout,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const isAdmin = user?.role === 'ADMIN';

  const navItemClass = (path: string) => {
    const isActive =
      currentPath === path ||
      (path === '/branch/dashboard' && currentPath === '/') ||
      (path === '/branch/dashboard' && currentPath === '/dashboard') ||
      (path === '/branch/policies' && currentPath === '/policies') ||
      (path === '/branch/claims' && currentPath === '/claims') ||
      (path === '/admin/branches' && currentPath === '/branches');

    if (isActive) {
      return 'flex items-center gap-2 px-3 py-2 transition-colors bg-[#dde9ff] text-[#0f1c2e] font-semibold rounded-lg shadow-sm';
    }
    return 'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#7f8dab] hover:bg-[#d6e3fc]/20 hover:text-[#0f1c2e] transition-colors';
  };

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#021129]/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#17263f] z-50 flex flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="p-4 flex items-center justify-between border-b border-[#7f8dab]/20">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => handleLinkClick('/branch/dashboard', e)}
          >
            {/* SVG Logo Mark */}
            <div className="w-8 h-8 rounded-lg bg-[#002c26] flex items-center justify-center text-[#93f4e3] border border-[#379c8e]/30 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] text-white font-bold leading-tight tracking-tight">United Insurance</span>
              <span className="text-[10px] text-[#7f8dab] uppercase tracking-wider font-semibold">Enterprise CRM</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#002c26] text-[#93f4e3] px-1.5 py-0.5 rounded border border-[#379c8e]/40">
            PRO
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-2.5 py-4 flex flex-col gap-5">
          {/* Workspace */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              Workspace
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/branch/dashboard"
                onClick={(e) => handleLinkClick('/branch/dashboard', e)}
                className={navItemClass('/branch/dashboard')}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Dashboard</span>
              </a>
              <a
                href="/branch/follow-ups"
                onClick={(e) => handleLinkClick('/branch/follow-ups', e)}
                className={navItemClass('/branch/follow-ups')}
              >
                <span className="material-symbols-outlined text-lg">assignment_late</span>
                <span>Follow-ups</span>
              </a>
            </div>
          </nav>

          {/* Administration */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              Administration
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/admin/branches"
                onClick={(e) => handleLinkClick('/admin/branches', e)}
                className={`justify-between ${navItemClass('/admin/branches')}`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">corporate_fare</span>
                  <span>Branches</span>
                </span>
                <span className="text-[10px] bg-[#4d5f7b] text-white px-1.5 py-0.5 rounded font-semibold tracking-wider">
                  ADMIN
                </span>
              </a>
              <a
                href="/branch/staff"
                onClick={(e) => handleLinkClick('/branch/staff', e)}
                className={navItemClass('/branch/staff')}
              >
                <span className="material-symbols-outlined text-lg">badge</span>
                <span>Staff Management</span>
              </a>
              <a
                href="/admin/reports"
                onClick={(e) => handleLinkClick('/admin/reports', e)}
                className={navItemClass('/admin/reports')}
              >
                <span className="material-symbols-outlined text-lg">analytics</span>
                <span>Reports</span>
              </a>
            </div>
          </nav>

          {/* Customer Operations */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              Customer Operations
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/branch/customers"
                onClick={(e) => handleLinkClick('/branch/customers', e)}
                className={navItemClass('/branch/customers')}
              >
                <span className="material-symbols-outlined text-lg">groups</span>
                <span>Customers</span>
              </a>
              <a
                href="/branch/leads"
                onClick={(e) => handleLinkClick('/branch/leads', e)}
                className={navItemClass('/branch/leads')}
              >
                <span className="material-symbols-outlined text-lg">filter_alt</span>
                <span>Leads</span>
              </a>
            </div>
          </nav>

          {/* Policy & Claims */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              Policy & Claims
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/branch/policies"
                onClick={(e) => handleLinkClick('/branch/policies', e)}
                className={navItemClass('/branch/policies')}
              >
                <span className="material-symbols-outlined text-lg">policy</span>
                <span>Policies</span>
              </a>
              <a
                href="/branch/renewals"
                onClick={(e) => handleLinkClick('/branch/renewals', e)}
                className={navItemClass('/branch/renewals')}
              >
                <span className="material-symbols-outlined text-lg">autorenew</span>
                <span>Renewals</span>
              </a>
              <a
                href="/branch/claims"
                onClick={(e) => handleLinkClick('/branch/claims', e)}
                className={navItemClass('/branch/claims')}
              >
                <span className="material-symbols-outlined text-lg">health_and_safety</span>
                <span>Claims</span>
              </a>
              <a
                href="/branch/documents"
                onClick={(e) => handleLinkClick('/branch/documents', e)}
                className={navItemClass('/branch/documents')}
              >
                <span className="material-symbols-outlined text-lg">folder_open</span>
                <span>Documents</span>
              </a>
            </div>
          </nav>

          {/* Finance */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              Finance
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/branch/commissions"
                onClick={(e) => handleLinkClick('/branch/commissions', e)}
                className={navItemClass('/branch/commissions')}
              >
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                <span>Commissions</span>
              </a>
            </div>
          </nav>

          {/* System */}
          <nav className="flex flex-col gap-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#7f8dab]/70 mb-0.5">
              System
            </div>
            <div className="flex flex-col gap-0.5">
              <a
                href="/branch/settings"
                onClick={(e) => handleLinkClick('/branch/settings', e)}
                className={navItemClass('/branch/settings')}
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                <span>Settings</span>
              </a>
              <a
                href="/branch/help"
                onClick={(e) => handleLinkClick('/branch/help', e)}
                className={navItemClass('/branch/help')}
              >
                <span className="material-symbols-outlined text-lg">help_center</span>
                <span>Help & Support</span>
              </a>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#7f8dab]/20 flex items-center justify-between text-[#7f8dab]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#93f4e3]">cloud_done</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-white">Server Active</span>
              <span className="text-[11px] text-[#7f8dab]">v4.12 Enterprise</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out of CRM"
            className="hover:text-white p-1 rounded hover:bg-[#d6e3fc]/10 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
