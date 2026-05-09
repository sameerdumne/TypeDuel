"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bolt,
  Crown,
  Flame,
  Gauge,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Swords,
  Trophy,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useGameActions } from "@/hooks/useGameSocket";
import { cn } from "@/lib/cn";
import { useMatchStore } from "@/store/useMatchStore";
import type { LeaderboardPlayer } from "@/types/game";

const fallbackLeaders: LeaderboardPlayer[] = [
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
    username: "neonclack",
    avatar_url: null,
    avg_wpm: 104,
    accuracy: 96.2,
    wins: 59,
    losses: 24,
    best_streak: 8,
    mmr: 1510,
    rank_name: "Gold",
    division: 2
  }
];

export function LandingPage() {
  const router = useRouter();
  const { joinQuickMatch, createRoom, joinRoom } = useGameActions();
  const connected = useMatchStore((state) => state.connected);
  const liveStats = useMatchStore((state) => state.liveStats);
  const queueState = useMatchStore((state) => state.queueState);
  const roomCode = useMatchStore((state) => state.roomCode);
  const [leaders, setLeaders] = useState<LeaderboardPlayer[]>(fallbackLeaders);
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard?limit=3")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload?.players?.length) {
          setLeaders(payload.players);
        }
      })
      .catch(() => setLeaders(fallbackLeaders));
  }, []);

  const startMatch = () => {
    joinQuickMatch();
    router.push("/match");
  };

  const startPrivateRoom = () => {
    createRoom();
    router.push("/match");
  };

  const submitInvite = () => {
    const code = inviteCode.trim();
    if (!code) {
      return;
    }

    joinRoom(code);
    router.push("/match");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:pt-14">
      <section className="grid min-h-[calc(100vh-8rem)] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="animate-floatIn">
          <Badge className="mb-6 border-cyan-300/25 bg-cyan-300/10">
            <RadioTower size={14} className="mr-2" />
            Server-authoritative real-time duels
          </Badge>

          <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.94] text-white sm:text-6xl lg:text-7xl">
            TypeDuel
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Face another player on the exact same paragraph, synced countdown, locked seed, and
            server-verified speed. Win with cleaner words, sharper accuracy, and faster finishes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={startMatch} disabled={!connected} className="min-h-12 px-6 text-base">
              <Swords size={20} />
              {queueState === "waiting" ? "Searching..." : "Start Match"}
              <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={startPrivateRoom} disabled={!connected}>
              <LockKeyhole size={18} />
              Private Room
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full sm:w-auto">
                Guest or Login
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="min-h-11 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-bold uppercase tracking-[0.18em] text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
              maxLength={12}
            />
            <Button variant="secondary" onClick={submitInvite} disabled={!connected || !inviteCode.trim()}>
              Join Room
            </Button>
          </div>

          {roomCode && (
            <p className="mt-3 text-sm font-semibold text-cyan-100">
              Private room ready: <span className="text-white">{roomCode}</span>
            </p>
          )}

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <StatCard label="Players online" value={liveStats.playersOnline} icon={<Users size={18} />} />
            <StatCard label="Active matches" value={liveStats.activeMatches} icon={<Bolt size={18} />} />
            <StatCard label="Queue" value={liveStats.queuedPlayers} icon={<Gauge size={18} />} />
          </div>
        </div>

        <div className="glass-panel relative overflow-hidden rounded-lg p-4 sm:p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(33,230,255,0.08),transparent)] opacity-70" />

          <div className="relative">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Live leaderboard
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">Top duelists</h2>
              </div>
              <Trophy className="text-amber-200" />
            </div>

            <div className="space-y-3">
              {leaders.map((leader, index) => (
                <div
                  key={leader.id}
                  className={cn(
                    "rounded-lg border border-white/10 bg-white/[0.06] p-4 transition hover:border-cyan-300/30 hover:bg-white/10",
                    index === 0 && "shadow-glow"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-arena-800 text-sm font-black text-cyan-100">
                        {index === 0 ? <Crown size={18} /> : index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black text-white">{leader.username}</p>
                        <p className="text-xs font-semibold text-slate-400">
                          {leader.rank_name} {leader.division} · {leader.mmr} MMR
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-cyan-100">{leader.avg_wpm}</p>
                      <p className="text-xs font-semibold text-slate-500">WPM</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-semibold text-slate-400">
                    <span>{leader.accuracy}% acc</span>
                    <span>{leader.wins} wins</span>
                    <span className="flex items-center gap-1">
                      <Flame size={13} className="text-amber-200" />
                      {leader.best_streak}
                    </span>
                  </div>
                  <ProgressBar value={Math.min((leader.mmr / 2200) * 100, 100)} className="mt-3" />
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
                <ShieldCheck className="mb-3 text-emerald-200" />
                <p className="font-bold text-white">Anti-cheat validation</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Keystroke pace, paste bursts, paragraph seed, and WPM are checked on the server.
                </p>
              </div>
              <div className="rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 p-4">
                <Swords className="mb-3 text-fuchsia-200" />
                <p className="font-bold text-white">Matched paragraphs</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Both players receive the same text and the same synchronized start time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
