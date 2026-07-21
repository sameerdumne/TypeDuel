"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
  },
  {
    id: "demo-3",
    username: "ghost_buffer",
    avatar_url: null,
    avg_wpm: 147,
    accuracy: 98.5,
    wins: 59,
    losses: 24,
    best_streak: 8,
    mmr: 1510,
    rank_name: "Gold",
    division: 2
  }
];

export function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>(demoPlayers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?scope=global&limit=25`);
      const payload = await response.json();
      if (payload.players?.length) {
        setPlayers(payload.players);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const podiumPlayers = players.slice(0, 3);
  const tablePlayers = players;

  const getRankBorder = (index: number) => {
    if (index === 0) return "border-t-neon-cyan";
    if (index === 1) return "border-t-slate-400";
    if (index === 2) return "border-t-yellow-500";
    return "border-t-glass-border";
  };

  const getRankBadge = (rankName: string) => {
    const lower = rankName.toLowerCase();
    if (lower === "diamond") return "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan";
    if (lower === "platinum") return "bg-slate-400/10 border-slate-400/30 text-slate-300";
    if (lower === "gold") return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    if (lower === "grandmaster") return "bg-purple-500/10 border-purple-500/30 text-purple-300";
    if (lower === "master") return "bg-red-500/10 border-red-500/30 text-red-300";
    return "bg-surface-bright border-glass-border text-text-muted";
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 relative z-[2]">
      <section className="text-center mb-16">
        <p className="label-caps text-primary-fixed-dim mb-2">RANKED LADDER</p>
        <h1 className="font-headline-lg text-headline-lg font-black uppercase tracking-tighter mb-4">
          The Hall of Fame
        </h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">
          Witness the fastest fingers in the digital arena. These typists have transcended human limits to claim their place at the summit.
        </p>
      </section>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-24">
        {podiumPlayers.map((player, index) => {
          const order = index === 0 ? "order-2 md:scale-105" : index === 1 ? "order-2 md:order-1" : "order-3";
          const isChampion = index === 0;

          return (
            <div key={player.id} className={cn("flex flex-col", order)}>
              <div
                className={cn(
                  "glass-panel rounded-xl p-8 flex flex-col items-center text-center transform transition-transform hover:-translate-y-2 border-t-4",
                  getRankBorder(index),
                  isChampion && "pulse-glow relative z-10"
                )}
              >
                {isChampion && (
                  <div className="absolute -top-6 bg-primary-fixed-dim text-on-primary px-6 py-1 label-caps rounded-full shadow-[0_0_20px_rgba(0,218,243,0.6)]">
                    REIGNING CHAMPION
                  </div>
                )}

                <div className="relative mb-6">
                  <div className={cn(
                    "rounded-full border-4 overflow-hidden bg-surface-container",
                    isChampion ? "w-32 h-32 border-primary-fixed-dim" : "w-24 h-24",
                    index === 1 && "border-slate-400",
                    index === 2 && "border-yellow-500"
                  )}>
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-text-muted">
                      {player.username.charAt(0)}
                    </div>
                  </div>
                  <div className={cn(
                    "absolute -bottom-2 -right-2 rounded-full flex items-center justify-center text-on-primary-fixed font-bold shadow-lg border-2 border-white/20",
                    isChampion ? "w-12 h-12 text-2xl rank-diamond" : "w-10 h-10 text-lg",
                    index === 1 && "rank-platinum",
                    index === 2 && "rank-gold"
                  )}>
                    {index + 1}
                  </div>
                </div>

                <span className={cn(
                  "label-caps mb-2",
                  index === 0 && "text-primary-fixed-dim",
                  index === 1 && "text-slate-400",
                  index === 2 && "text-yellow-500"
                )}>
                  {player.rank_name.toUpperCase()} DUELIST
                </span>
                <h3 className="font-headline-md text-headline-md text-white mb-4">{player.username}</h3>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-surface-lowest p-3 rounded-lg border border-glass-border">
                    <p className="label-caps text-[10px] text-text-muted">AVG WPM</p>
                    <p className="stats-value text-primary-fixed-dim">{player.avg_wpm}</p>
                  </div>
                  <div className="bg-surface-lowest p-3 rounded-lg border border-glass-border">
                    <p className="label-caps text-[10px] text-text-muted">ACCURACY</p>
                    <p className="stats-value text-tertiary-fixed-dim">{player.accuracy}%</p>
                  </div>
                </div>

                {isChampion && (
                  <p className="label-caps text-text-muted mt-4">
                    WIN RATE: {Math.round((player.wins / (player.wins + player.losses)) * 100)}%
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <section className="glass-panel rounded-xl overflow-hidden mb-24">
        <div className="p-8 border-b border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="font-headline-md text-headline-md uppercase tracking-wide">Top Global Duelists</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-low border border-glass-border rounded-lg pl-10 pr-4 py-2 font-body-md text-on-surface focus:border-primary-fixed-dim focus:ring-0 transition-all outline-none"
                placeholder="Search duelist..."
              />
            </div>
            <Button variant="secondary" onClick={() => load()}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-lowest border-b border-glass-border">
              <tr>
                <th className="px-8 py-4 label-caps text-text-muted">RANK</th>
                <th className="px-8 py-4 label-caps text-text-muted">DUELIST</th>
                <th className="px-8 py-4 label-caps text-text-muted">RANK TIER</th>
                <th className="px-8 py-4 label-caps text-text-muted text-right">AVG WPM</th>
                <th className="px-8 py-4 label-caps text-text-muted text-right">ACCURACY</th>
                <th className="px-8 py-4 label-caps text-text-muted text-right">WIN RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {tablePlayers
                .filter((p) => p.username.toLowerCase().includes(search.toLowerCase()))
                .map((player, index) => (
                <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 font-stats-value text-lg text-primary-fixed-dim">
                    #{index + 1}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-glass-border flex items-center justify-center text-sm font-bold text-text-muted">
                        {player.username.charAt(0)}
                      </div>
                      <span className="font-body-md font-bold text-white group-hover:text-primary-fixed transition-colors">
                        {player.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full border",
                      getRankBadge(player.rank_name)
                    )}>
                      <span className="label-caps text-[10px]">{player.rank_name.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-stats-value text-right text-primary-fixed-dim">{player.avg_wpm}</td>
                  <td className="px-8 py-6 font-stats-value text-right text-tertiary-fixed-dim">{player.accuracy}%</td>
                  <td className="px-8 py-6 font-stats-value text-right text-secondary-fixed-dim">
                    {Math.round((player.wins / (player.wins + player.losses)) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-glass-border bg-surface-container-low text-center">
          <p className="label-caps text-text-muted">SHOWING {tablePlayers.length} DUELISTS</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-panel rounded-xl p-8 text-center relative overflow-hidden">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black uppercase italic mb-6 relative z-10">
          Think You&apos;re Faster?
        </h2>
        <p className="text-on-surface-variant mb-10 max-w-xl mx-auto relative z-10">
          Jump into the arena now and start your climb to the top. The leaderboard resets every season.
        </p>
        <Link href="/match">
          <button className="bg-primary-container text-on-primary-fixed label-caps px-12 py-5 rounded-lg active:scale-95 transition-transform hover:brightness-110 shadow-[0_0_30px_rgba(33,230,255,0.4)] relative z-10 text-xl font-black">
            START YOUR DUEL
          </button>
        </Link>
      </section>

      {/* Rank Tier Cards */}
      <section className="mt-16 grid gap-4 md:grid-cols-5">
        {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((rank, index) => (
          <div key={rank} className="glass-panel rounded-lg p-4 border-t-2 border-t-glass-border">
            <Trophy className={cn("mb-3", index > 2 ? "text-neon-cyan" : "text-yellow-500")} size={24} />
            <p className="font-headline-md text-headline-md text-white">{rank}</p>
            <p className="mt-1 text-body-md text-text-muted">
              {index === 0 ? "0+" : index === 1 ? "1150+" : index === 2 ? "1350+" : index === 3 ? "1600+" : "1900+"} MMR
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
