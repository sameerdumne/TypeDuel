"use client";

import type { ReactNode } from "react";
import { Activity, Bot, Gauge, ShieldCheck, UserCircle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
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

  return (
    <aside className="glass-panel rounded-lg p-4">
      <div className="mb-5 flex items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-md border",
            side === "left"
              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
              : "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100"
          )}
        >
          {player?.isGuest ? <Bot size={22} /> : <UserCircle size={22} />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-black text-white">{player?.name ?? "Waiting..."}</p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {player ? `${player.rank} · ${player.mmr} MMR` : "No signal"}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-300">
          <span>Completion</span>
          <span>{Math.round(displayStats.completionPercent)}%</span>
        </div>
        <ProgressBar value={displayStats.completionPercent} tone={side === "left" ? "cyan" : "pink"} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={<Gauge size={16} />} label="WPM" value={Math.round(displayStats.wpm)} />
        <Metric icon={<ShieldCheck size={16} />} label="ACC" value={`${Math.round(displayStats.accuracy)}%`} />
        <Metric icon={<Activity size={16} />} label="ERR" value={displayStats.errors} />
      </div>

      <div
        className={cn(
          "mt-4 rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]",
          active
            ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
            : "border-white/10 bg-white/[0.06] text-slate-500"
        )}
      >
        {displayStats.completed ? "Finished" : active ? "Typing" : "Standby"}
      </div>
    </aside>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
      <div className="mb-2 text-cyan-100">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
