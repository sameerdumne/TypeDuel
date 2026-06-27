"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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
      return selfStats;
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
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center px-4 py-12 sm:px-6">
        <section className="glass-panel w-full rounded-lg p-5 sm:p-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              Matchmaking
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">Choose your duel</h1>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              Quick match pairs two live players. Private rooms generate invite codes for direct
              battles.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={joinQuickMatch}
              disabled={!connected}
              className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-5 text-left transition hover:border-cyan-300/50 hover:bg-cyan-300/15 disabled:opacity-50"
            >
              <Swords className="mb-5 text-cyan-200" />
              <p className="text-xl font-black text-white">Quick Match</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Queue for a ranked-feeling 1v1 with a synchronized paragraph.
              </p>
            </button>

            <button
              onClick={createRoom}
              disabled={!connected}
              className="rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 p-5 text-left transition hover:border-fuchsia-300/50 hover:bg-fuchsia-300/15 disabled:opacity-50"
            >
              <Users className="mb-5 text-fuchsia-200" />
              <p className="text-xl font-black text-white">Private Room</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Create a code and invite one opponent into a locked duel.
              </p>
            </button>

            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <Radio className="mb-5 text-emerald-200" />
              <p className="text-xl font-black text-white">Join Code</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-arena-950 px-3 text-sm font-bold uppercase tracking-[0.18em] text-white outline-none focus:border-cyan-300/60"
                  placeholder="CODE"
                  maxLength={12}
                />
                <Button variant="secondary" onClick={submitInvite} disabled={!connected || !inviteCode.trim()}>
                  Join
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 sm:flex-row">
            <p className="text-sm font-semibold text-slate-300">
              {queueState === "waiting" ? "Searching for an opponent..." : connected ? "Socket online." : "Socket server offline."}
            </p>
            {queueState === "waiting" && (
              <div className="flex items-center gap-3 text-cyan-100">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-bold uppercase tracking-[0.18em]">Queue active</span>
              </div>
            )}
            {roomCode && (
              <Button variant="secondary" onClick={copyRoom}>
                <Copy size={16} />
                {roomCode}
              </Button>
            )}
          </div>
          {error && <p className="mt-4 text-center text-sm font-semibold text-amber-100">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-5">
      <section className="mb-4 grid gap-3 rounded-lg border border-white/10 bg-arena-950/72 p-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
          <Timer size={18} className="text-cyan-200" />
          <span className="text-sm font-bold text-slate-300">Timer</span>
          <span className="ml-auto font-mono text-xl font-black text-white">{elapsed}s</span>
        </div>
        <div className="flex items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
          {countdownMs > 0 ? `Starts in ${Math.ceil(countdownMs / 1000)}` : started ? "Live duel" : "Match found"}
        </div>
        <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2">
          <span className="text-sm font-bold text-slate-300">Room</span>
          <span className="ml-auto font-mono text-sm font-black text-white">
            {match.roomCode ?? "QUICK"}
          </span>
          {match.roomCode && (
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={copyRoom} aria-label="Copy room code">
              <Copy size={15} />
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
        <PlayerPanel player={currentPlayer} stats={localStats} side="left" active={started} />

        <div className="glass-panel rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Shared paragraph
              </p>
              <h1 className="mt-1 text-2xl font-black text-white">
                {match.paragraph.difficulty} · {match.paragraph.category}
              </h1>
            </div>
            <div
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]",
                started
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                  : "border-amber-300/25 bg-amber-300/10 text-amber-100"
              )}
            >
              {started ? "Synced" : "Arming"}
            </div>
          </div>

          <ParagraphRenderer paragraph={match.paragraph.body} typed={typed} />

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
            className="mt-4 min-h-28 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-4 font-mono text-lg leading-8 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={started ? "" : "Get ready..."}
            aria-label="Typing input"
          />

          {error && <p className="mt-3 text-sm font-semibold text-amber-100">{error}</p>}

          <div className="mt-4 flex justify-center">
            <Button variant="danger" onClick={leaveMatch}>
              <LogOut size={18} />
              Leave Match
            </Button>
          </div>
        </div>

        <PlayerPanel
          player={opponent}
          stats={opponentUpdate?.stats}
          side="right"
          active={Boolean(opponentUpdate?.isTyping && started)}
        />
      </section>

      <MatchSummaryModal summary={summary} onClose={() => setSummary(undefined)} />
    </main>
  );
}
