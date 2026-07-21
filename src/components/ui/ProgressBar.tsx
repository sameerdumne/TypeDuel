import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  tone = "cyan",
  className
}: {
  value: number;
  tone?: "cyan" | "pink" | "green" | "amber" | "red";
  className?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const colors = {
    cyan: "bg-neon-cyan shadow-[0_0_8px_#21e6ff]",
    pink: "bg-neon-magenta shadow-[0_0_8px_#ffade3]",
    green: "bg-neon-green shadow-[0_0_8px_#4edea3]",
    amber: "bg-amber-400",
    red: "bg-neon-red"
  };

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-surface-bright", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-200", colors[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
