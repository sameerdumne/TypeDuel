"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Loader2, LogOut, Radio, Swords, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PlayerPanel } from "@/components/game/PlayerPanel";
import { ParagraphRenderer } from "@/components/game/ParagraphRenderer";
import { MatchSummaryModal } from "@/components/game/MatchSummaryModal";
import { useGameActions } from "@/hooks/useGameSocket";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/cn";
import { useMatchStore } from "@/store/useMatchStore";
import { calculateTypingStats, normalizeTypedValue } from "@/utils/typing";

export function MatchArena({ autoJoinCode }: { autoJoinCode?: string }) {
  const connected = useMatchStore((state) => state.connected);
  const player = useMatchStore((state) => state.player);
  const match = useMatchStore((state) => state.match);
  const queueState = useMatchStore((state) => state.queueState);
  const roomCode = useMatchStore((state) => state.roomCode);
  const countdownMs = useMatchStore((state) => state.countdownMs);
  const started = useMatchStore((state) => state.started);
  const typed = useMatchStore((state) => state.typed);
  const selfStats = useMatchStore((state) => state.selfStats);
  const opponentUpdate = useMatchStore((state) => state.opponent);
  const summary = useMatchStore((state) => state.summary);
  const error = useMatchStore((state) => state.error);
  const setTyped = useMatchStore((state) => state.setTyped);
  const setSummary = useMatchStore((state) => state.setSummary);
  const { joinQuickMatch, createRoom, joinRoom, sendTyping, leaveMatch } = useGameActions();
  const { keyClick, errorClick, matchFound } = useSoundEffects();
  const [inviteCode, setInviteCode] = useState(autoJoinCode ?? "");
  const [elapsed, setElapsed] = useState(0);
  const sendTimer = useRef<number | undefined>(undefined);
  const lastSentAt = useRef(0);
  const joinedCode = useRef<string | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoJoinCode && connected && joinedCode.current !== autoJoinCode) {
      joinedCode.current = autoJoinCode;
      joinRoom(autoJoinCode);
    }
  }, [autoJoinCode, connected, joinRoom]);

  useEffect(() => {
    if (match) {
      matchFound();
    }
  }, [match, matchFound]);

  useEffect(() => {
    if (!started || !match) {
      setElapsed(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed(Math.max(Math.floor((Date.now() - match.startsAt) / 1000), 0));
    }, 250);
    return () => window.clearInterval(interval);
  }, [match, started]);

  useEffect(() => {
    if (started) {
      inputRef.current?.focus();
    }
  }, [started]);

  const currentPlayer = useMemo(() => {
    return match?.players.find((candidate) => candidate.socketId === player?.socketId) ?? player;
  }, [match, player]);

  const opponent = useMemo(() => {
    return match?.players.find((candidate) => candidate.socketId !== player?.socketId);
  }, [match, player]);

  const localStats = useMemo(() => {
    if (!match) {
      return selfStats ?? { typedLength: 0, correctChars: 0, errors: 0, wpm: 0, accuracy: 100, completionPercent: 0, completed: false, suspiciousFlags: [] };
    }

    return calculateTypingStats({
      typed,
      paragraph: match.paragraph.body,
      startedAt: match.startsAt,
      now: Math.max(Date.now(), match.startsAt)
    });
  }, [match, selfStats, typed]);

  const pushTyping = (nextTyped: string) => {
    if (!match) {
      return;
    }

    const now = Date.now();
    const send = () => {
      lastSentAt.current = Date.now();
      sendTyping(nextTyped);
    };

    if (now - lastSentAt.current > 55) {
      send();
      return;
    }

    window.clearTimeout(sendTimer.current);
    sendTimer.current = window.setTimeout(send, 55);
  };

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!match || !started || summary) {
      return;
    }

    const nextTyped = normalizeTypedValue(event.target.value, match.paragraph.body);
    const lastCharacter = nextTyped[nextTyped.length - 1];
    const expected = match.paragraph.body[nextTyped.length - 1];
    setTyped(nextTyped);
    pushTyping(nextTyped);

    if (nextTyped.length > typed.length) {
      if (lastCharacter && lastCharacter !== expected) {
        errorClick();
      } else {
        keyClick();
      }
    }
  };

  const submitInvite = () => {
    if (!inviteCode.trim()) {
      return;
    }

    joinRoom(inviteCode.trim());
  };

  const copyRoom = async () => {
    const code = match?.roomCode ?? roomCode;
    if (!code) {
      return;
    }

    await navigator.clipboard?.writeText(code);
  };

  if (!match) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 relative z-[2]">
        <section className="glass-panel w-full rounded-xl p-5 sm:p-8">
          <div className="mb-8 text-center">
            <p className="label-caps text-primary-fixed-dim">MATCHMAKING</p>
            <h1 className="mt-2 font-headline-md text-headline-md text-on-surface">Choose your duel</h1>
            <p className="mx-auto mt-3 max-w-2xl text-on-surface-variant">
              Quick match pairs two live players. Private rooms generate invite codes for direct battles.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={joinQuickMatch}
              disabled={!connected}
              className="glass-panel rounded-lg border-t-4 border-t-neon-cyan p-5 text-left transition hover:-translate-y-1 disabled:opacity-50"
            >
              <Swords size={24} className="mb-5 text-neon-cyan" />
              <p className="font-headline-md text-headline-md text-white">Quick Match</p>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Queue for a ranked-feeling 1v1 with a synchronized paragraph.
              </p>
            </button>

            <button
              onClick={createRoom}
              disabled={!connected}
              className="glass-panel rounded-lg border-t-4 border-t-secondary p-5 text-left transition hover:-translate-y-1 disabled:opacity-50"
            >
              <Users size={24} className="mb-5 text-secondary" />
              <p className="font-headline-md text-headline-md text-white">Private Room</p>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Create a code and invite one opponent into a locked duel.
              </p>
            </button>

            <div className="glass-panel rounded-lg border-t-4 border-t-tertiary p-5">
              <Radio size={24} className="mb-5 text-tertiary" />
              <p className="font-headline-md text-headline-md text-white">Join Code</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container px-3 text-sm font-bold uppercase tracking-[0.18em] text-white outline-none focus:border-primary-fixed-dim"
                  placeholder="CODE"
                  maxLength={12}
                />
                <Button variant="secondary" onClick={submitInvite} disabled={!connected || !inviteCode.trim()}>
                  Join
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 glass-panel rounded-lg p-4 sm:flex-row">
            <p className="text-body-md font-semibold text-on-surface">
              {queueState === "waiting" ? "Searching for an opponent..." : connected ? "Socket online." : "Socket server offline."}
            </p>
            {queueState === "waiting" && (
              <div className="flex items-center gap-3 text-primary-fixed-dim">
                <Loader2 size={18} className="animate-spin" />
                <span className="label-caps">Queue active</span>
              </div>
            )}
            {roomCode && (
              <Button variant="secondary" onClick={copyRoom}>
                <Copy size={16} />
                {roomCode}
              </Button>
            )}
          </div>
          {error && <p className="mt-4 text-center text-sm font-semibold text-error-red">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-11 flex items-center justify-between px-6 glass-panel border-x-0 rounded-none">
        <div className="flex items-center gap-4">
          <Link href="/match">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border hover:bg-surface-bright transition-all active:scale-95">
              <span className="label-caps">BACK TO LOBBY</span>
            </button>
          </Link>
          <div className="h-6 w-px bg-glass-border" />
          <div className="label-caps text-outline tracking-widest">MATCH: #{match.roomCode ?? "QUICK"}</div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="label-caps text-outline">TIME REMAINING</span>
            <span className="stats-value text-primary">
              {countdownMs > 0
                ? `00:${String(Math.ceil(countdownMs / 1000)).padStart(2, "0")}`
                : `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className="label-caps text-outline block">CURRENT SPEED</span>
            <span className="stats-value text-primary-fixed-dim">
              {Math.round(localStats.wpm)} <small className="label-caps opacity-60">WPM</small>
            </span>
          </div>
        </div>
      </header>

      <main className="relative h-screen pt-11 flex items-center justify-center gap-12 max-w-[1400px] mx-auto px-8 z-[2]">
        <aside className="hidden lg:flex flex-col items-center h-[70%] relative gap-4">
          <span className="label-caps text-primary tracking-tighter">YOU</span>
          <div className="w-2 h-full bg-surface-bright rounded-full relative overflow-visible">
            <div
              className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-primary-container rounded-sm rotate-45 border-2 border-primary shadow-[0_0_15px_#21e6ff] transition-all duration-300"
              style={{ bottom: `${Math.round(localStats.completionPercent)}%` }}
            />
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 stats-value text-primary opacity-50">
              {Math.round(localStats.completionPercent)}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary text-sm font-bold">{currentPlayer?.name?.charAt(0) ?? "Y"}</span>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-4 items-center z-10">
          <div className="w-full flex justify-between gap-6">
            <div className="glass-panel rounded-xl px-6 py-4 flex-1 flex flex-col items-start shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
              <span className="label-caps text-outline mb-2">ACCURACY</span>
              <div className="flex items-baseline gap-2">
                <span className="stats-value text-on-surface">{Math.round(localStats.accuracy)}</span>
                <span className="label-caps text-outline">%</span>
              </div>
              <div className="mt-4 w-full h-2 bg-surface-bright rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-cyan shadow-[0_0_8px_#21e6ff] rounded-full transition-all duration-200"
                  style={{ width: `${Math.round(localStats.accuracy)}%` }}
                />
              </div>
            </div>
            <div className="glass-panel rounded-xl px-6 py-4 flex-1 flex flex-col items-start shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
              <span className="label-caps text-outline mb-2">ERRORS</span>
              <div className="flex items-baseline gap-2">
                <span className="stats-value text-on-surface">{localStats.errors}</span>
                <span className="label-caps text-secondary-fixed">ERR</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-full w-full p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] border-glass-border" id="typing-container">
            <div className="relative font-body-lg text-body-lg leading-relaxed select-none">
              <ParagraphRenderer paragraph={match.paragraph.body} typed={typed} />
            </div>
          </div>

          <textarea
            ref={inputRef}
            value={typed}
            onChange={onChange}
            onPaste={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            onBeforeInput={(event) => {
              const inputType = (event.nativeEvent as InputEvent).inputType;
              if (inputType === "insertFromPaste") {
                event.preventDefault();
              }
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={!started || Boolean(summary)}
            className="sr-only"
            placeholder={started ? "" : "Get ready..."}
            aria-label="Typing input"
          />

          <div className="flex gap-4 mt-2">
            <span className="label-caps text-outline">
              PRESS <kbd className="px-2 py-1 bg-surface-bright rounded text-on-surface border border-glass-border text-xs">ESC</kbd> TO PAUSE
            </span>
            <span className="text-outline/30">•</span>
            <span className="label-caps text-outline">AUTO-REFOCUS ENABLED</span>
          </div>
        </section>

        <aside className="hidden lg:flex flex-col items-center h-[70%] relative gap-4">
          <span className="label-caps text-secondary tracking-tighter">ENEMY</span>
          <div className="w-2 h-full bg-surface-bright rounded-full relative overflow-visible">
            <div
              className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-secondary-container rounded-sm rotate-45 border-2 border-secondary shadow-[0_0_15px_#ffade3] transition-all duration-300"
              style={{ bottom: `${Math.round(opponentUpdate?.stats?.completionPercent ?? 0)}%` }}
            />
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 stats-value text-secondary opacity-50">
              {Math.round(opponentUpdate?.stats?.completionPercent ?? 0)}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-secondary text-sm font-bold">{opponent?.name?.charAt(0) ?? "E"}</span>
          </div>
        </aside>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-11 flex items-center justify-center px-8 pointer-events-none z-[2]">
        <div className="glass-panel px-6 h-10 rounded-t-xl border-b-0 flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_5px_#6ffbbe]" />
            <span className="label-caps text-on-surface">CONNECTED</span>
          </div>
          <div className="h-4 w-px bg-glass-border" />
          <div className="flex items-center gap-2">
            <span className="label-caps text-outline">SERVER: NA-EAST</span>
          </div>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-lg px-6 py-3">
          <p className="text-sm font-semibold text-error-red">{error}</p>
        </div>
      )}

      <MatchSummaryModal summary={summary} onClose={() => setSummary(undefined)} />
    </>
  );
}
