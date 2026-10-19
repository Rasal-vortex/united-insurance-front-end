import { cn } from "@/lib/utils";

const variants = {
  upcoming: "border-[#e6dcf2] bg-[#f5f0fa] text-[#62488d]",
  due: "border-[#e6dcf2] bg-[#eee7f7] text-[#574078]",
  overdue: "border-[#f0d8d6] bg-[#fff5f4] text-[#9d4641]",
};

export function Badge({ variant = "upcoming", className, ...props }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-4", variants[variant] || variants.upcoming, className)} {...props} />;
}
