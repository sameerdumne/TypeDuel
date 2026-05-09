"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Gauge, Medal, Save, Shield, Swords, Trophy, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

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
  const winRate = useMemo(() => {
    if (!profile?.matches_played) {
      return 0;
    }

    return Math.round((profile.wins / profile.matches_played) * 100);
  }, [profile]);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((response) => (response.ok ? response.json() : null)),
      fetch("/api/matches?limit=6").then((response) => (response.ok ? response.json() : null))
    ])
      .then(([profilePayload, matchesPayload]) => {
        if (profilePayload?.profile) {
          setProfile(profilePayload.profile);
          setRanking(profilePayload.ranking);
          setUsername(profilePayload.profile.username);
        }

        if (matchesPayload?.matches) {
          setMatches(matchesPayload.matches);
        }
      })
      .catch(() => setMessage("Profile data is unavailable until Supabase is configured."));
  }, []);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(undefined);

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update profile.");
      return;
    }

    setProfile(payload.profile);
    setMessage("Profile saved.");
  };

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center px-4 py-12">
        <section className="glass-panel w-full rounded-lg p-8 text-center">
          <UserCircle className="mx-auto mb-4 text-cyan-200" size={42} />
          <h1 className="text-3xl font-black text-white">Guest profile</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Sign in to save match history, MMR, ranks, streaks, and persistent performance stats.
          </p>
          {message && <p className="mt-4 text-sm font-semibold text-amber-100">{message}</p>}
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="glass-panel rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
              <UserCircle size={32} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black text-white">{profile.username}</p>
              <p className="text-sm font-semibold text-slate-400">
                {ranking?.rank_name ?? profile.rank} {ranking?.division ?? 5} · {ranking?.mmr ?? 1000} MMR
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-3" onSubmit={saveProfile}>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="min-h-11 w-full rounded-md border border-white/10 bg-white/10 px-4 text-white outline-none transition focus:border-cyan-300/60"
                minLength={3}
                maxLength={24}
              />
            </label>
            {message && <p className="text-sm font-semibold text-cyan-100">{message}</p>}
            <Button type="submit" variant="secondary" className="w-full">
              <Save size={18} />
              Save Profile
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-300">
              <span>XP</span>
              <span>{profile.xp}</span>
            </div>
            <ProgressBar value={profile.xp % 100} tone="green" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Matches" value={profile.matches_played} icon={<Swords size={18} />} />
            <StatCard label="Win rate" value={`${winRate}%`} icon={<Trophy size={18} />} />
            <StatCard label="Avg WPM" value={Math.round(profile.avg_wpm)} icon={<Gauge size={18} />} />
            <StatCard label="Accuracy" value={`${Math.round(profile.accuracy)}%`} icon={<Shield size={18} />} />
          </div>

          <section className="glass-panel rounded-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Match history
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">Recent results</h2>
              </div>
              <Activity className="text-cyan-200" />
            </div>

            <div className="space-y-3">
              {matches.length === 0 && (
                <p className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-slate-400">
                  Your completed signed-in matches will appear here.
                </p>
              )}
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-black text-white">{match.won ? "Victory" : "Defeat"}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(match.created_at).toLocaleString()} · {Math.round(match.completion_percent)}%
                      complete
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-right text-sm font-bold text-slate-300">
                    <span>{Math.round(match.wpm)} WPM</span>
                    <span>{Math.round(match.accuracy)}%</span>
                    <span className={match.rank_delta >= 0 ? "text-emerald-200" : "text-red-200"}>
                      {match.rank_delta >= 0 ? "+" : ""}
                      {match.rank_delta}
                    </span>
                    <span className="text-cyan-100">+{match.xp_delta} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
