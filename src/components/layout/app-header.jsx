import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";

const pageNames = {
  "/": "Dashboard", "/dashboard": "Dashboard", "/branch/dashboard": "Dashboard", "/admin/dashboard": "Dashboard",
  "/branch/follow-ups": "Follow-ups", "/branch/activities": "Activities",
  "/admin/branches": "Branches", "/branches": "Branches", "/branch/staff": "Staff", "/staff": "Staff", "/staff-management": "Staff",
  "/admin/reports": "Reports", "/reports": "Reports", "/branch/customers": "Customers", "/customers": "Customers",
  "/branch/leads": "Leads", "/leads": "Leads", "/branch/policies": "Policies", "/policies": "Policies",
  "/branch/renewals": "Renewals", "/renewals": "Renewals", "/branch/claims": "Claims", "/claims": "Claims",
  "/branch/documents": "Documents", "/documents": "Documents", "/branch/commissions": "Commissions", "/commissions": "Commissions",
  "/follow-ups": "Follow-ups", "/activities": "Activities",
};

export const AppHeader = ({ user, onLogout, onOpenMobileSidebar, currentPath }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const userName = user?.name || "Account";
  const role = user?.userType === "ADMIN" ? "Administrator" : "Branch";

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === "Escape") setProfileOpen(false); };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[#e9e7ec] bg-white px-4 lg:left-56 lg:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button type="button" onClick={onOpenMobileSidebar} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-md text-[#625e68] hover:bg-[#f3f1f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7054a5] lg:hidden"><Menu size={19} /></button>
      <div className="flex min-w-0 items-center gap-2 text-[12px]">
        <span className="hidden text-[#8b8791] sm:inline">Workspace</span>
        <span aria-hidden="true" className="hidden text-[#c2bec8] sm:inline">/</span>
        <span className="truncate font-medium text-[#37343d]">{pageNames[currentPath] || "Dashboard"}</span>
      </div>
    </div>
    <div className="relative ml-3" ref={profileRef}>
      <button type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu" aria-label={`${userName}, ${role} account menu`} className="flex min-h-9 items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-[#f4f2f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7054a5]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ebe5f4] text-[#7054a5]"><UserRound size={15} /></span>
        <span className="hidden sm:block"><span className="block max-w-44 truncate text-[11px] font-medium leading-tight text-[#37343d]">{userName}</span><span className="mt-0.5 block text-[10px] leading-tight text-[#85818c]">{role}</span></span>
        <ChevronDown size={14} className={`text-[#85818c] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
      </button>
      {profileOpen && <div role="menu" className="absolute right-0 mt-2 w-48 rounded-lg border border-[#e9e7ec] bg-white p-1.5 shadow-lg">
        <div className="border-b border-[#efedf1] px-2.5 py-2"><p className="truncate text-[11px] font-medium text-[#37343d]">{userName}</p><p className="mt-0.5 text-[10px] text-[#85818c]">{role} account</p></div>
        <button type="button" role="menuitem" onClick={() => { setProfileOpen(false); onLogout(); }} className="mt-1 flex min-h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-[11px] font-medium text-[#6a526f] hover:bg-[#f4f1f6] focus-visible:outline-2 focus-visible:outline-[#7054a5]"><LogOut size={14} />Sign out</button>
      </div>}
    </div>
  </header>;
};
