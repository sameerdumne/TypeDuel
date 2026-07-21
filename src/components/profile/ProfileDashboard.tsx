"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, Medal, Swords, Trophy, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  matches_played: number;
  wins: number;
  losses: number;
  avg_wpm: number;
  accuracy: number;
  xp: number;
  rank: string;
  current_streak: number;
  best_streak: number;
};

type Ranking = {
  mmr: number;
  rank_name: string;
  division: number;
  win_streak: number;
  best_streak: number;
};

type MatchHistory = {
  id: string;
  wpm: number;
  accuracy: number;
  completion_percent: number;
  rank_delta: number;
  xp_delta: number;
  won: boolean;
  created_at: string;
};

export function ProfileDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [matches, setMatches] = useState<MatchHistory[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/matches?limit=6").then((r) => (r.ok ? r.json() : null))
    ]).then(([profilePayload, matchesPayload]) => {
      if (profilePayload?.profile) {
        setProfile(profilePayload.profile);
        setRanking(profilePayload.ranking);
        setUsername(profilePayload.profile.username);
      }
      if (matchesPayload?.matches) setMatches(matchesPayload.matches);
    }).catch(() => setMessage("Profile data is unavailable until Supabase is configured."));
  }, []);

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center px-4 py-12 relative z-[2]">
        <section className="glass-panel w-full rounded-xl p-8 text-center">
          <UserCircle className="mx-auto mb-4 text-neon-cyan" size={42} />
          <h1 className="font-headline-md text-headline-md text-white">Guest profile</h1>
          <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
            Sign in to save match history, MMR, ranks, streaks, and persistent performance stats.
          </p>
          {message && <p className="mt-4 text-sm font-semibold text-error-red">{message}</p>}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button>
                <Medal size={18} />
                Create Account
              </Button>
            </Link>
            <Link href="/match">
              <Button variant="secondary">
                <Swords size={18} />
                Play as Guest
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const level = Math.floor(profile.xp / 1000) + 1;
  const xpInLevel = profile.xp % 1000;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-[2]">
      {/* Profile Header */}
      <section className="glass-panel p-8 rounded-xl flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary-fixed-dim p-1">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-glass-border bg-surface-container flex items-center justify-center">
              <UserCircle size={48} className="text-text-muted" />
            </div>
          </div>
          <div className="absolute -bottom-2 right-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full label-caps shadow-lg">
            LVL {level}
          </div>
        </div>

        <div className="flex-1 w-full space-y-4 text-center md:text-left">
          <div>
            <h1 className="font-headline-lg text-headline-lg tracking-tighter text-primary-fixed">
              {profile.username}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-tertiary-fixed-dim mt-1">
              <Trophy size={18} />
              <span className="label-caps">
                RANK: {ranking?.rank_name ?? profile.rank} {ranking?.division ?? 5}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between label-caps text-text-muted">
              <span>XP PROGRESS</span>
              <span>{xpInLevel.toLocaleString()} / 1,000</span>
            </div>
            <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-glass-border">
              <div className="h-full bg-gradient-to-r from-primary-fixed-dim to-secondary-fixed-dim relative" style={{ width: `${xpInLevel / 10}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="label-caps text-text-muted">MMR RATING</div>
          <div className="stats-value text-primary-container">{ranking?.mmr ?? 1000}</div>
          <button className="mt-2 flex items-center gap-2 label-caps text-secondary-fixed-dim hover:text-secondary-fixed transition-colors">
            <Edit3 size={16} />
            EDIT PROFILE
          </button>
        </div>
      </section>

      {/* Combat Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="AVG WPM" value={Math.round(profile.avg_wpm)} border="border-l-primary-fixed-dim" />
        <StatCard label="PEAK WPM" value={Math.round(profile.avg_wpm * 1.2)} border="border-l-primary-fixed-dim" />
        <StatCard label="ACCURACY" value={`${Math.round(profile.accuracy)}%`} border="border-l-tertiary-fixed-dim" />
        <StatCard label="TOTAL DUELS" value={profile.matches_played} border="border-l-on-surface-variant" />
        <StatCard label="WIN STREAK" value={profile.best_streak} border="border-l-secondary-fixed-dim" glow />
      </section>

      {/* Match History */}
      <section className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-glass-border flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md tracking-tight text-on-surface">RECENT MATCHES</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low label-caps text-text-muted uppercase tracking-widest">
                <th className="px-6 py-4">RESULT</th>
                <th className="px-6 py-4">WPM / ACC</th>
                <th className="px-6 py-4">MMR CHANGE</th>
                <th className="px-6 py-4">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {matches.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-text-muted label-caps" colSpan={4}>
                    YOUR COMPLETED MATCHES WILL APPEAR HERE
                  </td>
                </tr>
              )}
              {matches.map((match) => (
                <tr key={match.id} className="hover:bg-surface-container-highest transition-colors group">
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded label-caps text-[10px]",
                      match.won
                        ? "bg-tertiary-container/20 text-tertiary-fixed-dim"
                        : "bg-error-container/20 text-error-red"
                    )}>
                      {match.won ? "VICTORY" : "DEFEAT"}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-body-lg text-primary">
                    {Math.round(match.wpm)} <span className="text-xs text-text-muted">/ {Math.round(match.accuracy)}%</span>
                  </td>
                  <td className={cn("px-6 py-5 font-bold", match.rank_delta >= 0 ? "text-tertiary-fixed-dim" : "text-error-red")}>
                    {match.rank_delta >= 0 ? "+" : ""}{match.rank_delta}
                  </td>
                  <td className="px-6 py-5 label-caps text-text-muted">
                    {new Date(match.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, border, glow }: { label: string; value: string | number; border: string; glow?: boolean }) {
  return (
    <div className={cn("glass-panel p-6 rounded-lg border-l-4 group hover:scale-[1.02] transition-transform", border)}>
      <div className="label-caps text-text-muted mb-2">{label}</div>
      <div className={cn("stats-value text-on-surface group-hover:text-primary-container transition-colors", glow && "text-secondary-fixed-dim")}>
        {value}
      </div>
    </div>
  );
}
