import { useState } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

export const AppShell = ({ currentPath, onNavigate, user, onLogout, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-crm-canvas font-sans text-crm-text antialiased">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-crm-surface px-4 py-3 text-sm font-semibold text-crm-sidebar focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <AppSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        user={user}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-56">
        <AppHeader
          user={user}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentPath={currentPath}
        />

        <main id="main-content" tabIndex={-1} className="relative flex min-h-screen w-full flex-col pt-14">{children}</main>
      </div>
    </div>
  );
};
