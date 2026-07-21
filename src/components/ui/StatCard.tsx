import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  icon,
  className
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-lg p-4 border-l-4 border-l-neon-cyan group hover:scale-[1.02] transition-transform", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="label-caps text-text-muted">{label}</span>
        <span className="text-neon-cyan">{icon}</span>
      </div>
      <div className="stats-value mt-3 text-on-surface group-hover:text-primary-container transition-colors">{value}</div>
    </div>
  );
}
