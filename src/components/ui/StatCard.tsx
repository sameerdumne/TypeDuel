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
    <div className={cn("glass-panel rounded-lg p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
        <span className="text-cyan-200">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
    </div>
  );
}
