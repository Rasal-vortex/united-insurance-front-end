import { cn } from "@/lib/utils";

export function Empty({ icon: Icon, title, description, action, className }) {
  return <div className={cn("flex min-h-48 flex-col items-center justify-center px-5 py-8 text-center", className)}>
    {Icon && <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-[#f5f0fa] text-[#7054a5]"><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span>}
    <p className="text-[13px] font-medium text-[#403c46]">{title}</p>
    {description && <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#77737e]">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>;
}
