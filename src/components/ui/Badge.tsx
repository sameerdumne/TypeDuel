import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100",
        className
      )}
    >
      {children}
    </span>
  );
}
