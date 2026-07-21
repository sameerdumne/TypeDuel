"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Keyboard, Loader2, Lock, Mail, Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { env, hasSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>();

  const isLogin = mode === "login";

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
            options: {
              data: { username },
              emailRedirectTo: `${env.appUrl}/login`
            }
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
    <main className="flex flex-grow items-center justify-center py-8 px-4 relative z-[2]">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 glass-panel rounded-xl overflow-hidden min-h-[700px] shadow-2xl">
        {/* Visual Side */}
        <div className="relative overflow-hidden hidden lg:block border-r border-glass-border">
          <div className="absolute inset-0 flex flex-col justify-center items-center p-8 z-10 bg-gradient-to-t from-[#070812] to-transparent">
            <div className="w-full text-center">
              <Keyboard size={48} className="mx-auto mb-4 text-neon-cyan" />
              <h2 className="font-headline-lg text-headline-lg text-primary uppercase tracking-widest mb-2">
                The Arena Awaits
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto">
                Hone your accuracy. Dominate the leaderboard.
                The fastest fingers in the digital world are gathering.
              </p>
            </div>
            {/* Stats Preview Card */}
            <div className="mt-8 glass-panel p-4 rounded-lg w-full max-w-sm border-l-4 border-neon-cyan">
              <p className="label-caps text-neon-cyan mb-2">GLOBAL CHAMPION SPEED</p>
              <div className="flex justify-between items-end">
                <div>
                  <span className="stats-value text-on-surface">192</span>
                  <span className="label-caps text-on-surface-variant ml-1">WPM</span>
                </div>
                <div className="text-right">
                  <span className="stats-value text-tertiary-fixed-dim">99.8</span>
                  <span className="label-caps text-on-surface-variant ml-1">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex flex-col p-8 md:p-12 lg:p-16 justify-center bg-surface-lowest/50">
          <div className="w-full max-w-md mx-auto">
            {/* Toggle Switch */}
            <div className="flex p-1 bg-surface-container rounded-full mb-10 relative">
              <div
                className={cn(
                  "absolute h-10 w-1/2 bg-surface-bright rounded-full transition-all duration-300 left-1 shadow-inner border border-glass-border"
                )}
                style={{ left: isLogin ? "4px" : "calc(50% - 4px)" }}
              />
              <Link href="/login" className="relative z-10 flex-1 py-2 text-center">
                <span
                  className={cn(
                    "label-caps transition-colors",
                    isLogin ? "text-on-surface" : "text-on-surface-variant"
                  )}
                >
                  Login
                </span>
              </Link>
              <Link href="/signup" className="relative z-10 flex-1 py-2 text-center">
                <span
                  className={cn(
                    "label-caps transition-colors",
                    !isLogin ? "text-on-surface" : "text-on-surface-variant"
                  )}
                >
                  Create Account
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
                {isLogin ? "Welcome Back, Duelist" : "Recruit New Duelist"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isLogin
                  ? "Enter your credentials to enter the arena."
                  : "Register your identity in the global arena."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={submit}>
              {mode === "signup" && (
                <div>
                  <label className="label-caps block text-outline-variant mb-2">INTERFACE NAME</label>
                  <div className="relative">
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      minLength={3}
                      maxLength={24}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg py-3.5 px-4 text-on-surface font-body-md focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-all outline-none"
                      placeholder="neonkeys"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label-caps block text-outline-variant mb-2">
                  INTERFACE IDENTIFIER (EMAIL)
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    autoComplete="email"
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3.5 pl-12 pr-4 text-on-surface font-body-md focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-all outline-none"
                    placeholder="duelist@typeduel.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label-caps text-outline-variant">
                    ENCRYPTION KEY (PASSWORD)
                  </label>
                  <Link
                    href="#"
                    className="label-caps text-primary-fixed-dim hover:text-primary transition-colors"
                  >
                    Lost Access?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-3.5 pl-12 pr-4 text-on-surface font-body-md focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-lg border border-error-red/30 bg-error-red/10 px-4 py-3 text-sm font-semibold text-error-red">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-fixed-dim text-on-primary font-label-caps text-label-caps py-4 rounded-lg mt-2 transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(0,218,243,0.3)] glow-active uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="mx-auto animate-spin" />
                ) : isLogin ? (
                  "Initiate Connection"
                ) : (
                  "Forge Account"
                )}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center mb-8">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-4 label-caps text-[10px] text-outline-variant">
                  OR CONNECT VIA
                </span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-bright border border-outline-variant rounded-lg py-3 transition-colors">
                  <span className="label-caps text-on-surface">DISCORD</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-bright border border-outline-variant rounded-lg py-3 transition-colors">
                  <span className="label-caps text-on-surface">GOOGLE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
