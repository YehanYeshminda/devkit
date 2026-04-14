export const code = `import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";

type StatsCardProps = {
  label: string;
  value: string;
  /** Percentage change vs previous period. Positive = green, negative = red. */
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function StatsCard({
  label,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  className,
}: StatsCardProps) {
  const positive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && (
          <div className="rounded-lg border border-border bg-muted/40 p-2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>

      {change !== undefined && (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            positive ? "text-emerald-500" : "text-red-500"
          )}
        >
          {positive ? (
            <TrendingUp className="size-3.5" />
          ) : (
            <TrendingDown className="size-3.5" />
          )}
          {positive && "+"}
          {change}% {changeLabel}
        </p>
      )}
    </div>
  );
}

// ── Usage ──────────────────────────────────────────────
// <StatsCard
//   label="Total Revenue"
//   value="$48,295"
//   change={12.4}
//   icon={<DollarSign className="size-4" />}
// />
`;
