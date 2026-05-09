"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Gamepad2, LogOut, Trophy, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-arena-950/72 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-glow">
            <Gamepad2 size={21} />
          </span>
          <span>
            <span className="block text-lg font-black tracking-wide text-white">TypeDuel</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:block">
              1v1 typing arena
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/match"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Arena
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Profile
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
                <Button variant="secondary" className="h-10 w-10 p-0" aria-label="Profile">
                  <UserCircle size={18} />
                </Button>
              </Link>
              <Button variant="ghost" className="h-10 w-10 p-0" onClick={signOut} aria-label="Sign out">
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <>
              <Link href="/leaderboard" className="md:hidden">
                <Button variant="secondary" className="h-10 w-10 p-0" aria-label="Leaderboard">
                  <Trophy size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" className="min-h-10 px-3">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
