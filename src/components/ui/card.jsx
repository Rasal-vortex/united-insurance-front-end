import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <section className={cn("rounded-lg border border-[#e9e7ec] bg-white shadow-[0_1px_3px_rgba(34,26,45,0.045)]", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("border-b border-[#efedf1] px-4 py-3", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4", className)} {...props} />;
}
