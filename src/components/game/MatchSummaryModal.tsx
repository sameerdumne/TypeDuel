"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Medal, Sparkles, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/cn";
import { useMatchStore } from "@/store/useMatchStore";
import type { MatchEndedPayload } from "@/types/game";

export function MatchSummaryModal({
  summary,
  onClose
}: {
  summary?: MatchEndedPayload;
  onClose: () => void;
}) {
  const player = useMatchStore((state) => state.player);
  const { victory } = useSoundEffects();
  const myResult = summary?.results.find((result) => result.player.socketId === player?.socketId);
  const won = Boolean(myResult?.won);

  useEffect(() => {
    if (!summary || !won) {
      return;
    }

    victory();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.72 },
      colors: ["#21E6FF", "#52FF9A", "#FF4FD8", "#FFD166"]
    });
  }, [summary, victory, won]);

  if (!summary || !myResult) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <section className="glass-panel w-full max-w-2xl rounded-lg p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              Match complete
            </p>
            <h2 className="mt-2 text-4xl font-black text-white">{won ? "Victory" : "Defeat"}</h2>
            <p className="mt-2 text-slate-300">{summary.reason}</p>
          </div>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close summary">
            <X size={18} />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryMetric label="WPM" value={Math.round(myResult.stats.wpm)} />
          <SummaryMetric label="Accuracy" value={`${Math.round(myResult.stats.accuracy)}%`} />
          <SummaryMetric label="Completion" value={`${Math.round(myResult.stats.completionPercent)}%`} />
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Medal size={16} />
              Rank delta
            </span>
            <span className={cn(myResult.rankDelta >= 0 ? "text-emerald-200" : "text-red-200")}>
              {myResult.rankDelta >= 0 ? "+" : ""}
              {myResult.rankDelta}
            </span>
          </div>
          <ProgressBar value={Math.min(Math.abs(myResult.rankDelta) * 3, 100)} tone={won ? "green" : "red"} />
          <div className="mt-4 flex items-center justify-between rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              XP gained
            </span>
            <span>+{myResult.xpDelta}</span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {summary.results.map((result) => (
            <div
              key={result.player.socketId}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {result.won && <Trophy size={15} className="mr-2 inline text-amber-200" />}
                  {result.player.name}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {result.stats.suspiciousFlags.length
                    ? `Flags: ${result.stats.suspiciousFlags.join(", ")}`
                    : "Clean server result"}
                </p>
              </div>
              <p className="text-right text-sm font-black text-cyan-100">
                {Math.round(result.stats.wpm)} WPM
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
