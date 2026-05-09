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
    cyan: "from-cyan-300 to-sky-500",
    pink: "from-fuchsia-400 to-pink-500",
    green: "from-emerald-300 to-lime-400",
    amber: "from-amber-200 to-orange-400",
    red: "from-rose-300 to-red-500"
  };

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-200", colors[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
