import React, { useState } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { AuthUser } from '@/types/auth';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: AuthUser | null;
  onLogout: () => void;
  onSwitchRole?: (role: 'ADMIN' | 'BRANCH') => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentPath,
  onNavigate,
  user,
  onLogout,
  onSwitchRole,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f9f9ff] font-sans text-[#0f1c2e] min-h-screen antialiased flex flex-col">
      {/* Persistent Sidebar */}
      <AppSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AppHeader
          user={user}
          onLogout={onLogout}
          onSwitchRole={onSwitchRole}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchGlobal={(term) => {
            if (term.trim()) {
              onNavigate(`/branch/policies?search=${encodeURIComponent(term)}`);
            }
          }}
        />

        {/* Dynamic Route Content */}
        <main className="relative pt-16 w-full flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
