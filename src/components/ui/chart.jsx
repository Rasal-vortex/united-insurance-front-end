import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function ChartContainer({ config, className, ariaLabel, children }) {
  const variables = Object.fromEntries(Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]));

  return <div role="img" aria-label={ariaLabel} className={cn("w-full", className)} style={variables}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      {children}
    </ResponsiveContainer>
  </div>;
}

export function ChartTooltipContent({ active, payload, label, config }) {
  if (!active || !payload?.length) return null;
  const series = payload[0];
  const title = config[series.dataKey]?.label || series.name;

  return <div className="min-w-32 rounded-md border border-[#e9e7ec] bg-white px-3 py-2 shadow-md">
    <p className="text-[11px] text-[#77737e]">{label}</p>
    <p className="mt-1 text-xs font-semibold text-[#302d36]">{series.value} {title?.toLowerCase()}</p>
  </div>;
}
