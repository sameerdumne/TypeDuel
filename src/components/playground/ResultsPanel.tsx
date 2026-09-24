"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePlaygroundStore } from "@/store/playgroundStore";

export function ResultsPanel() {
  const result = usePlaygroundStore((state) => state.result);
  const elapsedMs = usePlaygroundStore((state) => state.elapsedMs);
  const retry = usePlaygroundStore((state) => state.retry);

  useEffect(() => {
    if (!result) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "BUTTON" || target?.tagName === "A") {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        retry();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [result, retry]);

  if (!result) {
    return null;
  }

  const time = formatTime(elapsedMs ?? result.completionMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section
        className="glass-panel w-full max-w-xl rounded-lg p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Practice results"
      >
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary-fixed-dim">
            Solo session {result.completed ? "complete" : "ended early"}
          </p>
          <h2 className="mt-2 text-4xl font-black text-white">Results</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ResultMetric label="WPM" value={Math.round(result.wpm)} />
          <ResultMetric label="Accuracy" value={`${Math.round(result.accuracy)}%`} />
          <ResultMetric label="Time" value={time} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link href="/" className="sm:order-first">
            <Button variant="ghost" className="w-full">
              Exit
            </Button>
          </Link>
          <Button onClick={retry} autoFocus>
            <RefreshCcw size={16} />
            Try again
          </Button>
        </div>
      </section>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function formatTime(ms?: number) {
  if (ms == null) {
    return "\u2014";
  }

  const totalSeconds = Math.max(Math.round(ms / 1000), 1);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${totalSeconds}s`;
}