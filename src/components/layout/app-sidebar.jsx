import {
  Activity, BadgeCheck, Building2, CalendarClock, ChevronRight,
  FileText, FolderOpen, GitBranch, LayoutDashboard, ShieldCheck,
  Users, UserRoundSearch, WalletCards, X,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Workspace",
    links: [
      { label: "Dashboard", href: "/branch/dashboard", icon: LayoutDashboard },
      { label: "Follow-ups", href: "/branch/follow-ups", icon: CalendarClock },
      { label: "Activities", href: "/branch/activities", icon: Activity },
    ],
  },
  {
    title: "Administration",
    links: [
      { label: "Branches", href: "/admin/branches", icon: GitBranch, adminOnly: true },
      { label: "Staff", href: "/branch/staff", icon: BadgeCheck },
      { label: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    title: "Customers",
    links: [
      { label: "Customers", href: "/branch/customers", icon: Users },
      { label: "Leads", href: "/branch/leads", icon: UserRoundSearch },
    ],
  },
  {
    title: "Policies & claims",
    links: [
      { label: "Policies", href: "/branch/policies", icon: ShieldCheck },
      { label: "Renewals", href: "/branch/renewals", icon: CalendarClock },
      { label: "Claims", href: "/branch/claims", icon: FileText },
      { label: "Documents", href: "/branch/documents", icon: FolderOpen },
    ],
  },
  {
    title: "Finance",
    links: [{ label: "Commissions", href: "/branch/commissions", icon: WalletCards }],
  },
];

export const AppSidebar = ({ currentPath, onNavigate, user, mobileOpen = false, onCloseMobile }) => {
  const isAdmin = user?.userType === "ADMIN";
  const aliases = {
    "/branch/dashboard": ["/", "/dashboard", "/admin/dashboard"],
    "/admin/branches": ["/branches"],
    "/branch/staff": ["/staff", "/staff-management"],
    "/branch/customers": ["/customers"],
    "/branch/leads": ["/leads"],
    "/branch/policies": ["/policies"],
    "/branch/renewals": ["/renewals"],
    "/branch/claims": ["/claims"],
    "/branch/follow-ups": ["/follow-ups"],
    "/branch/activities": ["/activities"],
    "/branch/documents": ["/documents"],
    "/branch/commissions": ["/commissions"],
    "/admin/reports": ["/reports"],
  };
  const isActive = (path) => currentPath === path || (aliases[path] || []).includes(currentPath);

  const handleLinkClick = (path, event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      onCloseMobile?.();
      return;
    }
    event.preventDefault();
    onNavigate(path);
    onCloseMobile?.();
  };

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation" onClick={onCloseMobile} className="fixed inset-0 z-40 bg-[#24212b]/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-[#e9e7ec] bg-[#f8f7f9] transition-transform duration-200 motion-reduce:transition-none lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between border-b border-[#e9e7ec] px-4">
          <button type="button" onClick={() => { onNavigate("/branch/dashboard"); onCloseMobile?.(); }} className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7054a5]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7054a5] text-white"><ShieldCheck size={18} strokeWidth={2.2} /></span>
            <span className="min-w-0"><span className="block truncate text-[13px] font-semibold leading-tight text-[#302d36]">United Insurance</span><span className="mt-0.5 block text-[10px] leading-tight text-[#85818c]">CRM workspace</span></span>
          </button>
          <button type="button" onClick={onCloseMobile} className="rounded-md p-1.5 text-[#77737e] hover:bg-[#eeebf2] lg:hidden" aria-label="Close navigation"><X size={17} /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navigationGroups.map((group) => {
            const links = group.links.filter((link) => !link.adminOnly || isAdmin);
            if (!links.length) return null;
            return <nav key={group.title} aria-label={group.title}>
              <h2 className="mb-1.5 px-2 text-[10px] font-semibold tracking-[0.08em] text-[#96929c]">{group.title}</h2>
              <div className="space-y-0.5">
                {links.map(({ label, href, icon: Icon, adminOnly }) => <a key={href} href={href} onClick={(event) => handleLinkClick(href, event)} aria-current={isActive(href) ? "page" : undefined} className={`group flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7054a5] ${isActive(href) ? "bg-[#ebe5f4] font-semibold text-[#62488d]" : "text-[#64616b] hover:bg-[#efedf1] hover:text-[#302d36]"}`}>
                  <Icon size={16} strokeWidth={1.8} className={isActive(href) ? "text-[#7054a5]" : "text-[#898590] group-hover:text-[#65518a]"} />
                  <span className="flex-1">{label}</span>
                  {adminOnly && <span className="rounded bg-[#e5e2e9] px-1.5 py-0.5 text-[9px] font-semibold text-[#686470]">Admin</span>}
                  {isActive(href) && <ChevronRight size={13} className="text-[#8068a8]" />}
                </a>)}
              </div>
            </nav>;
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-[#e9e7ec] px-5 py-3 text-[10px] text-[#85818c]"><Building2 size={14} strokeWidth={1.8} /><span>Insurance operations</span></div>
      </aside>
    </>
  );
};
