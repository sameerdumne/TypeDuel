"use client";

import { useMemo } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { usePlaygroundStore } from "@/store/playgroundStore";
import type { Difficulty, ParagraphCategory } from "@/types/game";

const DIFFICULTIES: { label: string; value: Difficulty }[] = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" }
];

const LABEL: Record<ParagraphCategory, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  programming: "Programming",
  random: "Random"
};

export function DifficultySelector() {
  const paragraphs = usePlaygroundStore((state) => state.paragraphs);
  const difficulty = usePlaygroundStore((state) => state.difficulty);
  const category = usePlaygroundStore((state) => state.category);
  const setDifficulty = usePlaygroundStore((state) => state.setDifficulty);
  const setCategory = usePlaygroundStore((state) => state.setCategory);
  const shuffle = usePlaygroundStore((state) => state.shuffle);

  const categories = useMemo(
    () => Array.from(new Set(paragraphs.map((entry) => entry.category))).sort(),
    [paragraphs]
  );

  return (
    <section className="glass-panel mb-5 rounded-xl p-5 sm:p-6" aria-label="Paragraph settings">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label-caps text-primary-fixed-dim">SOLO PLAYGROUND</p>
          <h1 className="mt-2 font-headline-md text-headline-md text-on-surface">
            Practice without an opponent
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Sharpen raw speed and accuracy. Nothing here affects ranks or your scoreboard standing.
          </p>
        </div>
        <Button variant="secondary" onClick={shuffle}>
          <RefreshCcw size={16} />
          Shuffle
        </Button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="label-caps mb-3 text-outline">DIFFICULTY</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                aria-pressed={difficulty === option.value}
                className={cn(
                  "label-caps inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border px-4 py-2 text-xs transition active:scale-[0.98]",
                  difficulty === option.value
                    ? "border-primary-fixed-dim/60 bg-primary-fixed-dim/15 text-primary-fixed-dim shadow-[0_0_16px_rgba(0,218,243,0.15)]"
                    : "border-white/[0.12] bg-white/5 text-text-muted hover:border-neon-cyan/50 hover:text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <div>
            <p className="label-caps mb-3 text-outline">CATEGORY</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory(undefined)}
                aria-pressed={category === undefined}
                className={cn(
                  "label-caps inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-xs transition active:scale-[0.98]",
                  category === undefined
                    ? "border-primary-fixed-dim/60 bg-primary-fixed-dim/15 text-primary-fixed-dim shadow-[0_0_16px_rgba(0,218,243,0.15)]"
                    : "border-white/[0.12] bg-white/5 text-text-muted hover:border-neon-cyan/50 hover:text-white"
                )}
              >
                All
              </button>
              {categories.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setCategory(entry)}
                  aria-pressed={category === entry}
                  className={cn(
                    "label-caps inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-xs transition active:scale-[0.98]",
                    category === entry
                      ? "border-primary-fixed-dim/60 bg-primary-fixed-dim/15 text-primary-fixed-dim shadow-[0_0_16px_rgba(0,218,243,0.15)]"
                      : "border-white/[0.12] bg-white/5 text-text-muted hover:border-neon-cyan/50 hover:text-white"
                  )}
                >
                  {LABEL[entry] ?? entry}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}