"use client";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardPage } from "@/screens/branch/dashboard/page";
import { PoliciesPage } from "@/screens/branch/policies/page";
import { ClaimsPage } from "@/screens/branch/claims/page";
import { BranchesPage } from "@/screens/admin/branches/page";
import { CustomersPage } from "@/screens/branch/customers/page";
import { LeadsPage } from "@/screens/branch/leads/page";
import { RenewalsPage } from "@/screens/branch/renewals/page";
import { StaffPage } from "@/screens/branch/staff/page";
import { FollowUpsPage } from "@/screens/branch/follow-ups/page";
import { DocumentsPage } from "@/screens/branch/documents/page";
import { CommissionsPage } from "@/screens/branch/commissions/page";
import { ReportsPage } from "@/screens/admin/reports/page";
import { ActivitiesPage } from "@/screens/branch/activities/page";
import AuthSwitch from "@/components/ui/auth-switch";
import { getStoredSession, clearStoredSession } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";

export default function App({ initialPath = "/branch/dashboard" }) {
  const [currentPath, setCurrentPath] = useState(
    initialPath === "/" ? "/branch/dashboard" : initialPath
  );
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.token && session?.user ? session.user : null);
    setSessionReady(true);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/branch/dashboard");
    };
    const handleAuthChange = () => {
      const session = getStoredSession();
      setUser(session?.token && session?.user ? session.user : null);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("auth_session_changed", handleAuthChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("auth_session_changed", handleAuthChange);
    };
  }, []);

  const navigate = (path) => {
    setCurrentPath(path);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
    }
  };

  const handleLogout = () => {
    const loginPath = user?.userType === "ADMIN" ? "/auth/admin-login" : "/auth/branch-login";
    clearStoredSession();
    setUser(null);
    navigate(loginPath);
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    navigate(authenticatedUser?.userType === "ADMIN" ? "/admin/dashboard" : "/branch/dashboard");
  };

  const isLoginPath =
    currentPath === "/auth/admin-login" ||
    currentPath === "/(auth)/admin-login" ||
    currentPath === "/auth/branch-login" ||
    currentPath === "/(auth)/branch-login";

  const adminLoginRequired =
    currentPath === "/admin/branches" || currentPath === "/branches";

  useEffect(() => {
    if (sessionReady && !user && !isLoginPath) {
      navigate(adminLoginRequired ? "/auth/admin-login" : "/auth/branch-login");
    } else if (sessionReady && user && !canAccessRoute(user.userType, currentPath)) {
      navigate(user.userType === "ADMIN" ? "/admin/dashboard" : "/branch/dashboard");
    }
  }, [sessionReady, user, currentPath, isLoginPath, adminLoginRequired]);

  if (!sessionReady) return null;

  if (!user && !isLoginPath) {
    return adminLoginRequired
      ? <AuthSwitch initialMode="admin" onSuccess={handleLoginSuccess} onNavigate={navigate} />
      : <AuthSwitch initialMode="branch" onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentPath === "/auth/admin-login" || currentPath === "/(auth)/admin-login") {
    if (user) return null;
    return <AuthSwitch initialMode="admin" onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentPath === "/auth/branch-login" || currentPath === "/(auth)/branch-login") {
    if (user) return null;
    return <AuthSwitch initialMode="branch" onSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (user && !canAccessRoute(user.userType, currentPath)) return null;

  const renderContent = () => {
    switch (currentPath) {
      case "/":
      case "/dashboard":
      case "/branch/dashboard":
      case "/admin/dashboard":
        return <DashboardPage onNavigate={navigate} user={user} />;
      case "/policies":
      case "/branch/policies":
        return <PoliciesPage onNavigate={navigate} user={user} />;
      case "/claims":
      case "/branch/claims":
        return <ClaimsPage onNavigate={navigate} user={user} />;
      case "/branches":
      case "/admin/branches":
        return <BranchesPage onNavigate={navigate} />;
      case "/customers":
      case "/branch/customers":
        return <CustomersPage onNavigate={navigate} user={user} />;
      case "/leads":
      case "/branch/leads":
        return <LeadsPage onNavigate={navigate} user={user} />;
      case "/renewals":
      case "/branch/renewals":
        return <RenewalsPage onNavigate={navigate} />;
      case "/staff":
      case "/branch/staff":
      case "/staff-management":
        return <StaffPage onNavigate={navigate} user={user} />;
      case "/follow-ups":
      case "/branch/follow-ups":
        return <FollowUpsPage onNavigate={navigate} user={user} />;
      case "/activities":
      case "/branch/activities":
        return <ActivitiesPage onNavigate={navigate} />;
      case "/documents":
      case "/branch/documents":
        return <DocumentsPage onNavigate={navigate} user={user} />;
      case "/commissions":
      case "/branch/commissions":
        return <CommissionsPage onNavigate={navigate} user={user} />;
      case "/reports":
      case "/admin/reports":
        return <ReportsPage onNavigate={navigate} />;
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
    >
      {renderContent()}
    </AppShell>
  );
}
