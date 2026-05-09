"use client";

import { useEffect, useState } from "react";
import { Crown, Flame, Medal, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type { LeaderboardPlayer } from "@/types/game";

const demoPlayers: LeaderboardPlayer[] = [
  {
    id: "demo-1",
    username: "keystorm",
    avatar_url: null,
    avg_wpm: 128,
    accuracy: 98.8,
    wins: 84,
    losses: 21,
    best_streak: 14,
    mmr: 1960,
    rank_name: "Diamond",
    division: 2
  },
  {
    id: "demo-2",
    username: "syntaxrush",
    avatar_url: null,
    avg_wpm: 116,
    accuracy: 97.4,
    wins: 71,
    losses: 18,
    best_streak: 11,
    mmr: 1740,
    rank_name: "Platinum",
    division: 1
  }
];

export function LeaderboardPage() {
  const [scope, setScope] = useState<"global" | "daily">("global");
  const [players, setPlayers] = useState<LeaderboardPlayer[]>(demoPlayers);
  const [loading, setLoading] = useState(false);

  const load = async (nextScope = scope) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?scope=${nextScope}&limit=25`);
      const payload = await response.json();
      if (payload.players?.length) {
        setPlayers(payload.players);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">Ranked ladder</p>
          <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Leaderboard</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Bronze to Diamond progression powered by MMR, win streaks, WPM, and clean finishes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={scope === "global" ? "primary" : "secondary"}
            onClick={() => setScope("global")}
          >
            Global
          </Button>
          <Button
            variant={scope === "daily" ? "primary" : "secondary"}
            onClick={() => setScope("daily")}
          >
            Daily
          </Button>
          <Button variant="ghost" onClick={() => load()} aria-label="Refresh leaderboard">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-lg">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:grid-cols-[auto_1fr_repeat(4,auto)]">
          <span>#</span>
          <span>Player</span>
          <span className="hidden sm:block">WPM</span>
          <span className="hidden sm:block">Accuracy</span>
          <span className="hidden sm:block">Streak</span>
          <span>MMR</span>
        </div>
        <div className="divide-y divide-white/10">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition hover:bg-white/[0.05] sm:grid-cols-[auto_1fr_repeat(4,auto)]",
                index === 0 && "bg-amber-300/[0.04]"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] font-black text-cyan-100">
                {index === 0 ? <Crown size={18} className="text-amber-200" /> : index + 1}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-white">{player.username}</p>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <Medal size={14} />
                  {player.rank_name} {player.division}
                </p>
                <ProgressBar value={Math.min((player.mmr / 2200) * 100, 100)} className="mt-3 sm:hidden" />
              </div>
              <span className="hidden text-right font-black text-cyan-100 sm:block">
                {Math.round(player.avg_wpm)}
              </span>
              <span className="hidden text-right font-bold text-slate-300 sm:block">
                {Math.round(player.accuracy)}%
              </span>
              <span className="hidden items-center justify-end gap-1 font-bold text-amber-100 sm:flex">
                <Flame size={15} />
                {player.best_streak}
              </span>
              <span className="text-right">
                <span className="block font-black text-white">{player.mmr}</span>
                <span className="text-xs font-bold text-slate-500 sm:hidden">
                  {Math.round(player.avg_wpm)} WPM
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((rank, index) => (
          <div key={rank} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <Trophy className={cn("mb-3", index > 2 ? "text-cyan-200" : "text-amber-200")} />
            <p className="font-black text-white">{rank}</p>
            <p className="mt-1 text-sm text-slate-400">
              {index === 0 ? "0+" : index === 1 ? "1150+" : index === 2 ? "1350+" : index === 3 ? "1600+" : "1900+"} MMR
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
