"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, LogOut, Trophy, UserCircle } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import { useMatchStore } from "@/store/useMatchStore";

export function NavBar() {
  const connected = useMatchStore((state) => state.connected);
  const player = useMatchStore((state) => state.player);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (!hasSupabaseEnv()) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[rgba(8,13,28,0.72)] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl font-black italic tracking-tighter text-neon-cyan">
            TypeDuel
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/match"
            className="label-caps text-xs text-text-muted transition-colors duration-200 hover:text-neon-cyan"
          >
            Arena
          </Link>
          <Link
            href="/leaderboard"
            className="label-caps text-xs text-text-muted transition-colors duration-200 hover:text-neon-cyan"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="label-caps text-xs text-text-muted transition-colors duration-200 hover:text-neon-cyan"
          >
            Training
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] sm:inline-flex",
              connected
                ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                : "border-amber-300/30 bg-amber-300/10 text-amber-100"
            )}
          >
            <Activity size={14} />
            {connected ? "Live" : "Offline"}
          </span>

          {player && (
            <span className="hidden max-w-28 truncate rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-200 sm:inline">
              {player.name}
            </span>
          )}

          {signedIn ? (
            <>
              <Link href="/profile" className="md:hidden">
                <button className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.12] bg-white/10 text-white transition hover:border-neon-cyan/50 hover:bg-white/[0.15]">
                  <UserCircle size={18} />
                </button>
              </Link>
              <button
                onClick={signOut}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-transparent bg-transparent text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link href="/leaderboard" className="md:hidden">
                <button className="flex h-10 w-10 items-center justify-center rounded-md border border-white/[0.12] bg-white/10 text-white transition hover:border-neon-cyan/50 hover:bg-white/[0.15]">
                  <Trophy size={18} />
                </button>
              </Link>
              <Link href="/login">
                <button className="label-caps inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/[0.12] bg-white/10 px-4 py-2 text-xs text-white transition duration-200 hover:border-neon-cyan/50 hover:bg-white/[0.15]">
                  Login
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
