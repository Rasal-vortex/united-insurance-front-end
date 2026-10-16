import React, { useState, useRef, useEffect } from 'react';
import { AuthUser } from '@/types/auth';

interface AppHeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
  onSwitchRole?: (role: 'ADMIN' | 'BRANCH') => void;
  onOpenMobileSidebar?: () => void;
  onSearchGlobal?: (term: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onLogout,
  onSwitchRole,
  onOpenMobileSidebar,
  onSearchGlobal,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchGlobal) {
      onSearchGlobal(searchQuery);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/95 backdrop-blur-md z-40 border-b border-[#e6eeff] flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left: Mobile Toggle + Breadcrumbs + Branch Badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-[#44474d] hover:bg-[#eff3ff] lg:hidden"
          title="Open menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-1 text-[#44474d] text-xs font-medium">
          <span className="hover:text-[#0f1c2e] cursor-pointer">Enterprise</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="hover:text-[#0f1c2e] cursor-pointer">Operations</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#cadeff] px-2.5 py-1 rounded-full text-[#061c35]">
          <span className="material-symbols-outlined text-sm">domain</span>
          <span className="text-[11px] font-semibold whitespace-nowrap">
            {user?.branchName || 'Metro Central Branch #04'}
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search Input */}
        <div className="relative hidden md:flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#75777e] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search policies, customers, claims, staff... [Ctrl+K]"
            className="pl-9 pr-4 py-1.5 w-64 lg:w-80 bg-[#eff3ff] border border-[#d6e3fc] rounded-lg text-[13px] text-[#0f1c2e] placeholder:text-[#75777e] focus:outline-none focus:border-[#002c26] focus:bg-white transition-all"
          />
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-lg text-[#44474d] hover:bg-[#dde9ff] transition-colors relative flex items-center justify-center"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
          </button>
        </div>

        {/* Hairline Divider */}
        <div className="h-8 w-px bg-[#d6e3fc] hidden sm:block"></div>

        {/* Profile Lockup */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#eff3ff] transition-colors text-left"
          >
            <img
              src={
                user?.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDaaCCDSetpUsgUpaY5QAD6PqqlhKNYNPNUjGth8p4MebIjj3zyLkI63THqiTSvbx1khgXZCAkZmTba78878ZsTsh1GLWblMtMdfYXv7PK3clipwRiL0pT4xoRWgU7483eJkdg3vK-Anw87ZIz0qAwpcWJPMHnzp38Ih8UCrl38lHWLe07YVhaOHqE_A95LQkgfD30WxMssorLfZHW7clStTJSdUTXsJCV0ieU0-jb10bUxYLByq71fmA'
              }
              alt="User Profile"
              className="w-8 h-8 rounded-full object-cover border border-[#d6e3fc]"
            />
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-semibold text-[#0f1c2e] leading-none">
                  {user?.name || 'Eleanor Vance'}
                </span>
                <span className="material-symbols-outlined text-sm text-[#44474d]">unfold_more</span>
              </div>
              <span className="text-[11px] text-[#44474d] leading-none mt-1">
                {user?.designation || (user?.role === 'ADMIN' ? 'Branch Director / Admin' : 'Branch Staff')}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e6eeff] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#e6eeff]">
                <p className="text-[13px] font-semibold text-[#0f1c2e]">{user?.name || 'Eleanor Vance'}</p>
                <p className="text-[11px] text-[#75777e] truncate">{user?.email || 'admin@unitedins.com'}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#cadeff] text-[#061c35]">
                    {user?.role || 'ADMIN'}
                  </span>
                  <span className="text-[11px] text-[#44474d]">{user?.branchName || 'Metro Central #04'}</span>
                </div>
              </div>

              {/* Role Toggle for Testing */}
              {onSwitchRole && (
                <div className="px-4 py-2 border-b border-[#e6eeff]">
                  <p className="text-[11px] uppercase tracking-wider text-[#75777e] font-semibold mb-1">
                    Simulate Role:
                  </p>
                  <div className="flex items-center gap-1 bg-[#eff3ff] p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('ADMIN');
                        setProfileOpen(false);
                      }}
                      className={`flex-1 py-1 text-center text-xs font-semibold rounded-md transition-all ${
                        user?.role === 'ADMIN'
                          ? 'bg-white text-[#0f1c2e] shadow-xs'
                          : 'text-[#44474d] hover:text-[#0f1c2e]'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('BRANCH');
                        setProfileOpen(false);
                      }}
                      className={`flex-1 py-1 text-center text-xs font-semibold rounded-md transition-all ${
                        user?.role === 'BRANCH'
                          ? 'bg-white text-[#0f1c2e] shadow-xs'
                          : 'text-[#44474d] hover:text-[#0f1c2e]'
                      }`}
                    >
                      Branch
                    </button>
                  </div>
                </div>
              )}

              <div className="py-1">
                <a
                  href="/branch/settings"
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#0f1c2e] hover:bg-[#eff3ff] transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <span className="material-symbols-outlined text-base text-[#44474d]">settings</span>
                  <span>System Preferences</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
