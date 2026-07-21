"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Swords,
  Trophy,
  UserCircle
} from "lucide-react";
import { useGameActions } from "@/hooks/useGameSocket";
import { cn } from "@/lib/cn";
import { useMatchStore } from "@/store/useMatchStore";
import type { LeaderboardPlayer } from "@/types/game";

const fallbackLeaders: LeaderboardPlayer[] = [
  {
    id: "demo-1",
    username: "XENO_CORE",
    avatar_url: null,
    avg_wpm: 168,
    accuracy: 99.2,
    wins: 84,
    losses: 21,
    best_streak: 14,
    mmr: 1960,
    rank_name: "Diamond",
    division: 2
  },
  {
    id: "demo-2",
    username: "SYNTH_WAVE",
    avatar_url: null,
    avg_wpm: 154,
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
    username: "PROTOCOL_ZERO",
    avatar_url: null,
    avg_wpm: 149,
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

  const submitInvite = () => {
    const code = inviteCode.trim();
    if (!code) return;
    joinRoom(code);
    router.push("/match");
  };

  return (
    <main className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 animate-floatIn">
            <h1 className="text-5xl sm:text-6xl lg:text-[48px] font-extrabold italic uppercase tracking-tighter text-white leading-none">
              DOMINATE <span className="text-neon-cyan">THE GRID</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-muted opacity-80">
              High-octane 1v1 typing battles for the digital elite. No fluff, just pure speed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 animate-floatIn" style={{ animationDelay: "200ms" }}>
            <button
              onClick={startMatch}
              disabled={!connected}
              className="label-caps inline-flex items-center justify-center gap-2 bg-neon-cyan text-[#00363d] px-10 py-4 text-lg font-bold transition-all duration-200 active:scale-95 hover:shadow-glow-strong disabled:opacity-50 disabled:cursor-not-allowed animate-pulseGlow"
            >
              {queueState === "waiting" ? "SEARCHING..." : "BATTLE NOW"}
              <ArrowRight size={18} />
            </button>
            <Link href="/leaderboard">
              <button className="label-caps inline-flex items-center justify-center gap-2 border border-neon-cyan/50 text-neon-cyan px-10 py-4 text-lg font-bold glass-panel hover:bg-neon-cyan/10 transition-all duration-200 active:scale-95 w-full sm:w-auto">
                VIEW LEADERBOARDS
              </button>
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row animate-floatIn" style={{ animationDelay: "300ms" }}>
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              className="min-h-11 rounded-md border border-white/10 bg-white/10 px-4 text-sm font-bold uppercase tracking-[0.18em] text-white outline-none transition placeholder:text-slate-500 focus:border-neon-cyan/60"
              maxLength={12}
            />
            <button
              onClick={submitInvite}
              disabled={!connected || !inviteCode.trim()}
              className="label-caps inline-flex items-center justify-center gap-2 border border-white/[0.12] bg-white/10 px-6 py-2 text-xs text-white transition duration-200 hover:border-neon-cyan/50 hover:bg-white/[0.15] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              JOIN ROOM
            </button>
          </div>

          {roomCode && (
            <p className="mt-3 text-sm font-semibold text-neon-cyan">
              Private room ready: <span className="text-white">{roomCode}</span>
            </p>
          )}

          {/* Floating Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 animate-floatIn" style={{ animationDelay: "400ms" }}>
            <div className="glass-panel px-6 py-4 flex flex-col items-center min-w-[180px]">
              <span className="stats-value text-neon-cyan">{liveStats.playersOnline}</span>
              <span className="label-caps text-[10px] text-text-muted tracking-[0.2em]">DUELISTS ONLINE</span>
            </div>
            <div className="glass-panel px-6 py-4 flex flex-col items-center min-w-[180px]">
              <span className="stats-value text-neon-green">{liveStats.activeMatches}</span>
              <span className="label-caps text-[10px] text-text-muted tracking-[0.2em]">ACTIVE MATCHES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-arena-800 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 group hover:border-neon-cyan/50 transition-all duration-500">
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-neon-cyan/10 text-neon-cyan">
                <Swords size={24} />
              </div>
              <h3 className="font-headline-md text-headline-md mb-2 text-white">REAL-TIME DUELS</h3>
              <p className="text-body-md text-text-muted">Zero-latency WebSocket architecture ensures every keystroke counts. Battle opponents globally in millisecond-precise encounters.</p>
            </div>

            <div className="glass-panel p-8 group hover:border-neon-cyan/50 transition-all duration-500" style={{ animationDelay: "150ms" }}>
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-neon-green/10 text-neon-green">
                <Trophy size={24} />
              </div>
              <h3 className="font-headline-md text-headline-md mb-2 text-white">RANKED LADDER</h3>
              <p className="text-body-md text-text-muted">Climb from Bronze to Grandmaster. Our Elo-based matchmaking puts you against warriors of equal speed and precision.</p>
            </div>

            <div className="glass-panel p-8 group hover:border-neon-cyan/50 transition-all duration-500" style={{ animationDelay: "300ms" }}>
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg bg-neon-red/10 text-neon-red">
                <Shield size={24} />
              </div>
              <h3 className="font-headline-md text-headline-md mb-2 text-white">ANTI-CHEAT</h3>
              <p className="text-body-md text-text-muted">Server-authoritative validation and heuristic analysis keep the arena clean. Only human speed is tolerated here.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Arena Preview */}
      <section className="py-16 bg-arena-950 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-headline-lg font-extrabold uppercase tracking-tighter text-white mb-8">THE ARENA AWAITS</h2>
          <div className="relative mx-auto max-w-5xl">
            <div className="glass-panel rounded-xl overflow-hidden shadow-glass border-white/20">
              <div className="bg-arena-400 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-neon-red/50"></div>
                  <div className="w-3 h-3 rounded-full bg-neon-green/50"></div>
                  <div className="w-3 h-3 rounded-full bg-neon-cyan/50"></div>
                </div>
                <div className="mx-auto bg-arena-600 px-6 py-1 rounded text-[10px] text-text-muted font-mono">typeduel.arena/match/active</div>
              </div>
              <div className="p-8 md:p-12 bg-arena-800 text-left relative min-h-[400px] flex flex-col justify-center">
                <div className="flex justify-between items-end mb-12">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded bg-neon-cyan flex items-center justify-center font-bold text-black">YOU</div>
                    <div>
                      <div className="label-caps text-neon-cyan">WPM</div>
                      <div className="stats-value">142</div>
                    </div>
                  </div>
                  <div className="text-center stats-value text-4xl text-white/20 tracking-widest">VERSUS</div>
                  <div className="flex gap-4 items-center flex-row-reverse text-right">
                    <div className="w-12 h-12 rounded bg-neon-red flex items-center justify-center font-bold text-black">CPU</div>
                    <div>
                      <div className="label-caps text-neon-red">WPM</div>
                      <div className="stats-value">138</div>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-3xl leading-relaxed text-white/30 tracking-tight">
                  <span className="text-neon-cyan border-r-2 border-neon-cyan animate-pulse">Efficiency</span> is doing things right; effectiveness is doing the right things. The goal of TypeDuel is to push the boundaries of human-computer interaction through...
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div className="px-3 py-1 rounded-full bg-arena-500 text-[10px] font-mono text-text-muted">ACC: 99.4%</div>
                  <div className="px-3 py-1 rounded-full bg-arena-500 text-[10px] font-mono text-text-muted">POS: #1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season Elite */}
      <section className="py-16 bg-arena-800 relative">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-headline-md text-headline-md text-white mb-2">SEASON ELITE</h2>
              <p className="label-caps text-text-muted">TOP DUELISTS THIS HOUR</p>
            </div>
            <div className="flex flex-col gap-4">
              {leaders.map((leader, index) => (
                <div
                  key={leader.id}
                  className={cn(
                    "glass-panel p-4 flex items-center justify-between transition-all duration-300",
                    index === 0 && "border-l-4 border-l-neon-cyan shadow-glow"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <span className={cn("stats-value text-2xl w-8", index === 0 ? "text-neon-cyan" : "text-text-muted")}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-arena-400 flex items-center justify-center">
                      {leader.avatar_url ? (
                        <img className="w-full h-full object-cover" src={leader.avatar_url} alt={leader.username} />
                      ) : (
                        <UserCircle size={20} className="text-text-muted" />
                      )}
                    </div>
                    <span className="font-headline-md text-lg text-white">{leader.username}</span>
                  </div>
                  <div className="text-right">
                    <span className="block stats-value text-xl text-neon-cyan">{leader.avg_wpm}</span>
                    <span className="label-caps text-[10px] text-text-muted">AVG WPM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
