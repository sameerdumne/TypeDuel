"use client";

import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DifficultySelector } from "@/components/playground/DifficultySelector";
import { ResultsPanel } from "@/components/playground/ResultsPanel";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { calculateTypingStats } from "@/utils/typing";

export function PlaygroundArena() {
  const paragraph = usePlaygroundStore((state) => state.paragraph);
  const loading = usePlaygroundStore((state) => state.loading);
  const phase = usePlaygroundStore((state) => state.phase);
  const typed = usePlaygroundStore((state) => state.typed);
  const startedAt = usePlaygroundStore((state) => state.startedAt);
  const result = usePlaygroundStore((state) => state.result);
  const loadParagraphs = usePlaygroundStore((state) => state.loadParagraphs);
  const setTyped = usePlaygroundStore((state) => state.setTyped);
  const giveUp = usePlaygroundStore((state) => state.giveUp);
  const resetPlayground = usePlaygroundStore((state) => state.resetPlayground);
  const { keyClick, errorClick } = useSoundEffects();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    loadParagraphs();
    return () => resetPlayground();
  }, [loadParagraphs, resetPlayground]);

  useEffect(() => {
    if (!loading && paragraph && phase !== "results") {
      inputRef.current?.focus();
    }
  }, [loading, paragraph, phase]);

  useEffect(() => {
    if (phase !== "typing") {
      return;
    }
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    caretRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [typed]);

  const localStats = useMemo(() => {
    if (!paragraph || !startedAt) {
      return undefined;
    }
    return calculateTypingStats({
      typed,
      paragraph: paragraph.body,
      startedAt,
      now: Math.max(now || Date.now(), startedAt)
    });
  }, [paragraph, startedAt, now, typed]);

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!paragraph || phase === "results") {
      return;
    }

    const next = event.target.value;
    const expanded = next.length > typed.length;
    setTyped(next);

    if (expanded) {
      const index = next.length - 1;
      if (index < paragraph.body.length) {
        if (next[index] === paragraph.body[index]) {
          keyClick();
        } else {
          errorClick();
        }
      }
    }
  };

  const onBlur = () => {
    if (phase !== "results") {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  if (loading || !paragraph) {
    return (
      <main className="relative z-[2] flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <section className="glass-panel flex w-full max-w-md flex-col items-center gap-4 rounded-xl p-8">
          <Loader2 size={28} className="animate-spin text-primary-fixed-dim" />
          <p className="label-caps text-text-muted">Loading paragraphs...</p>
        </section>
      </main>
    );
  }

  const characters = paragraph.body.split("");
  const typedCount = Math.min(typed.length, characters.length);

  return (
    <main className="relative z-[2] flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-5xl">
        <header className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="label-caps text-outline transition-colors hover:text-neon-cyan"
          >
            EXIT PRACTICE
          </Link>
          {phase === "setup" && (
            <span className="label-caps text-neon-green/80">NO SERVER REQUIRED</span>
          )}
        </header>

        {phase === "setup" && <DifficultySelector />}

        {phase !== "setup" && (
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-xl px-6 py-4">
              <span className="label-caps text-outline">WPM</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="stats-value text-on-surface">
                  {Math.round(localStats?.wpm ?? result?.wpm ?? 0)}
                </span>
                <span className="label-caps text-outline">WPM</span>
              </div>
            </div>
            <div className="glass-panel rounded-xl px-6 py-4">
              <span className="label-caps text-outline">ACCURACY</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="stats-value text-on-surface">
                  {Math.round(localStats?.accuracy ?? result?.accuracy ?? 0)}
                </span>
                <span className="label-caps text-outline">%</span>
              </div>
            </div>
            <div className="glass-panel rounded-xl px-6 py-4">
              <span className="label-caps text-outline">CHARACTERS</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="stats-value text-on-surface">
                  {localStats?.typedLength ?? result?.typedLength ?? 0}
                </span>
                <span className="label-caps text-outline">/ {characters.length}</span>
              </div>
            </div>
          </div>
        )}

        <div
          id="playground-typing-panel"
          className="glass-panel w-full rounded-full p-8 shadow-glass sm:p-10 border-glass-border"
        >
          <div className="select-none whitespace-pre-wrap font-mono text-xl font-semibold leading-9 sm:text-2xl sm:leading-10">
            {characters.map((character, index) => {
              const isTyped = index < typedCount;
              const isCaret = index === typedCount;
              return (
                <Fragment key={index}>
                  {isCaret && <span ref={caretRef} className="typing-caret" aria-hidden="true" />}
                  <span
                    className={
                      isTyped ? (typed[index] === character ? "type-success" : "type-error") : "type-dim"
                    }
                  >
                    {character}
                  </span>
                </Fragment>
              );
            })}
            {typedCount >= characters.length && (
              <span ref={caretRef} className="typing-caret" aria-hidden="true" />
            )}
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={typed}
          onChange={onChange}
          onBlur={onBlur}
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
          disabled={phase === "results"}
          className="sr-only"
          aria-label="Typing input"
        />

        <div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <span className="label-caps text-outline">
              {phase === "setup"
                ? "FIRST KEYSTROKE STARTS THE TIMER"
                : phase === "typing"
                  ? "AUTO-REFOCUS ENABLED"
                  : "SESSION COMPLETE - PRESS ENTER TO RE-ROLL"}
            </span>
            <span className="text-outline/30">{"\u2022"}</span>
            <span className="label-caps text-outline">LOCAL-ONLY</span>
          </div>
          {phase === "typing" && (
            <Button variant="danger" onClick={giveUp}>
              Give up
            </Button>
          )}
        </div>
      </div>

      {phase === "results" && <ResultsPanel />}
    </main>
  );
}