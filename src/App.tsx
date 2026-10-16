import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardPage } from '@/app/branch/dashboard/page';
import { PoliciesPage } from '@/app/branch/policies/page';
import { ClaimsPage } from '@/app/branch/claims/page';
import { BranchesPage } from '@/app/admin/branches/page';
import { CustomersPage } from '@/app/branch/customers/page';
import { LeadsPage } from '@/app/branch/leads/page';
import { RenewalsPage } from '@/app/branch/renewals/page';
import { StaffPage } from '@/app/branch/staff/page';
import { FollowUpsPage } from '@/app/branch/follow-ups/page';
import { DocumentsPage } from '@/app/branch/documents/page';
import { CommissionsPage } from '@/app/branch/commissions/page';
import { ReportsPage } from '@/app/admin/reports/page';
import { SettingsPage } from '@/app/branch/settings/page';
import { HelpPage } from '@/app/branch/help/page';
import { AdminLoginPage } from '@/app/auth/admin-login/page';
import { BranchLoginPage } from '@/app/auth/branch-login/page';
import { AuthUser } from '@/types/auth';
import { getStoredSession, DEFAULT_BRANCH_USER, setStoredSession, clearStoredSession } from '@/lib/auth';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      return p && p !== '/' ? p : '/branch/dashboard';
    }
    return '/branch/dashboard';
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = getStoredSession();
    return session ? session.user : DEFAULT_BRANCH_USER;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/branch/dashboard');
    };
    const handleAuthChange = () => {
      const session = getStoredSession();
      setUser(session ? session.user : null);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('auth_session_changed', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('auth_session_changed', handleAuthChange);
    };
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
    navigate('/auth/branch-login');
  };

  const handleLoginSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    navigate('/branch/dashboard');
  };

  const handleSwitchRole = (role: 'ADMIN' | 'BRANCH') => {
    if (!user) return;
    const updated: AuthUser = {
      ...user,
      role,
      designation: role === 'ADMIN' ? 'Branch Director / Admin' : 'Branch Underwriter',
    };
    setUser(updated);
    setStoredSession({
      token: 'jwt_' + role.toLowerCase() + '_token',
      user: updated,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    });
  };

  // Auth pages view without AppShell
  if (currentPath === '/auth/admin-login' || currentPath === '/(auth)/admin-login') {
    return <AdminLoginPage onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentPath === '/auth/branch-login' || currentPath === '/(auth)/branch-login') {
    return <BranchLoginPage onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  // Render current route view
  const renderContent = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
      case '/branch/dashboard':
      case '/admin/dashboard':
        return <DashboardPage onNavigate={navigate} />;

      case '/policies':
      case '/branch/policies':
        return <PoliciesPage onNavigate={navigate} />;

      case '/claims':
      case '/branch/claims':
        return <ClaimsPage onNavigate={navigate} />;

      case '/branches':
      case '/admin/branches':
        return <BranchesPage onNavigate={navigate} />;

      case '/customers':
      case '/branch/customers':
        return <CustomersPage onNavigate={navigate} />;

      case '/leads':
      case '/branch/leads':
        return <LeadsPage onNavigate={navigate} />;

      case '/renewals':
      case '/branch/renewals':
        return <RenewalsPage onNavigate={navigate} />;

      case '/staff':
      case '/branch/staff':
      case '/staff-management':
        return <StaffPage onNavigate={navigate} />;

      case '/follow-ups':
      case '/branch/follow-ups':
        return <FollowUpsPage onNavigate={navigate} />;

      case '/documents':
      case '/branch/documents':
        return <DocumentsPage onNavigate={navigate} />;

      case '/commissions':
      case '/branch/commissions':
        return <CommissionsPage onNavigate={navigate} />;

      case '/reports':
      case '/admin/reports':
        return <ReportsPage onNavigate={navigate} />;

      case '/settings':
      case '/branch/settings':
        return <SettingsPage onNavigate={navigate} />;

      case '/help':
      case '/branch/help':
      case '/help-support':
        return <HelpPage onNavigate={navigate} />;

      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <AppShell
      currentPath={currentPath}
      onNavigate={navigate}
      user={user}
      onLogout={handleLogout}
      onSwitchRole={handleSwitchRole}
    >
      {renderContent()}
    </AppShell>
  );
}
