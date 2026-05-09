"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gamepad2, Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(undefined);

    if (!hasSupabaseEnv()) {
      setMessage("Supabase environment variables are not configured yet.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { username } }
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-arena-950/80 shadow-glow lg:grid-cols-[0.92fr_1.08fr]">
        <div className="hidden border-r border-white/10 bg-grid-glow bg-[length:38px_38px] p-8 lg:block">
          <Badge className="mb-8 bg-cyan-300/10">Supabase Auth</Badge>
          <h1 className="text-4xl font-black leading-tight text-white">
            {mode === "signup" ? "Claim your handle." : "Back to the arena."}
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Track wins, MMR, rank gains, match history, average WPM, and accuracy across every
            server-verified duel.
          </p>
          <div className="mt-10 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5">
            <Gamepad2 className="mb-4 text-cyan-200" />
            <p className="font-bold text-white">Guest mode stays open.</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Signed-in accounts save progression; guests can still jump into live matches.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              {mode === "signup" ? "Create account" : "Login"}
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              {mode === "signup" ? "Start ranking up" : "Enter TypeDuel"}
            </h2>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-300">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  minLength={3}
                  maxLength={24}
                  className="min-h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                  placeholder="neonkeys"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                autoComplete="email"
                className="min-h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="min-h-12 w-full rounded-md border border-white/10 bg-white/10 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                placeholder="••••••••"
              />
            </label>

            {message && (
              <p className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : mode === "signup" ? <UserPlus size={18} /> : <LogIn size={18} />}
              {mode === "signup" ? "Create Account" : "Login"}
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/match" className="flex-1">
              <Button variant="secondary" className="w-full">
                Continue as Guest
              </Button>
            </Link>
            <Link href={mode === "signup" ? "/login" : "/signup"} className="flex-1">
              <Button variant="ghost" className="w-full">
                {mode === "signup" ? "Have an account" : "Create account"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
