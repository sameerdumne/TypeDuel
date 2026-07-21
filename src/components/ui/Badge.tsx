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
        "label-caps inline-flex items-center rounded-full border border-glass-border bg-surface-container px-3 py-1 text-neon-cyan",
        className
      )}
    >
      {children}
    </span>
  );
}
