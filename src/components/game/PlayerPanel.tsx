"use client";

import type { ReactNode } from "react";
import { Activity, Bot, Gauge, ShieldCheck, UserCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublicPlayer, TypingStats } from "@/types/game";

const emptyStats: TypingStats = {
  typedLength: 0,
  correctChars: 0,
  errors: 0,
  wpm: 0,
  accuracy: 100,
  completionPercent: 0,
  completed: false,
  suspiciousFlags: []
};

export function PlayerPanel({
  player,
  stats,
  side,
  active
}: {
  player?: PublicPlayer;
  stats?: TypingStats;
  side: "left" | "right";
  active?: boolean;
}) {
  const displayStats = stats ?? emptyStats;
  const isLeft = side === "left";

  return (
    <aside className={cn("glass-panel rounded-xl p-4 border-l-4", isLeft ? "border-l-primary-container" : "border-l-secondary")}>
      <div className="mb-4 flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
            isLeft
              ? "border-primary-container text-primary"
              : "border-secondary text-secondary"
          )}
        >
          {player?.isGuest ? <Bot size={22} /> : <UserCircle size={22} />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-headline-md text-headline-md text-white">{player?.name ?? "Waiting..."}</p>
          <p className="label-caps text-text-muted">
            {player ? `${player.rank} · ${player.mmr} MMR` : "No signal"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="label-caps text-outline">COMPLETION</span>
          <span className="stats-value text-lg text-on-surface">{Math.round(displayStats.completionPercent)}%</span>
        </div>
        <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-200",
              isLeft ? "bg-neon-cyan shadow-[0_0_8px_#21e6ff]" : "bg-neon-magenta shadow-[0_0_8px_#ffade3]"
            )}
            style={{ width: `${Math.round(displayStats.completionPercent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={<Gauge size={16} />} label="WPM" value={Math.round(displayStats.wpm)} />
        <Metric icon={<ShieldCheck size={16} />} label="ACC" value={`${Math.round(displayStats.accuracy)}%`} />
        <Metric icon={<Activity size={16} />} label="ERR" value={displayStats.errors} />
      </div>

      <div
        className={cn(
          "mt-4 rounded-lg border px-3 py-2 text-center label-caps",
          displayStats.completed
            ? "border-primary-container/30 bg-primary-container/10 text-primary"
            : active
              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-200"
              : "border-glass-border bg-white/[0.06] text-text-muted"
        )}
      >
        {displayStats.completed ? "FINISHED" : active ? "TYPING" : "STANDBY"}
      </div>
    </aside>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-glass-border bg-surface-container p-3 text-center">
      <div className="mb-1 flex justify-center text-neon-cyan">{icon}</div>
      <p className="label-caps text-text-muted">{label}</p>
      <p className="stats-value text-lg text-on-surface mt-1">{value}</p>
    </div>
  );
}
