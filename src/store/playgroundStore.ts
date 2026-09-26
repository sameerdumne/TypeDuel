"use client";

import { create } from "zustand";
import { FALLBACK_PARAGRAPHS, makeMatchSeed, selectParagraph } from "@/services/paragraphs";
import type { Difficulty, ParagraphCategory, SharedParagraph, TypingStats } from "@/types/game";
import { calculateTypingStats, normalizeTypedValue } from "@/utils/typing";

export type PlaygroundPhase = "setup" | "typing" | "results";

type PlaygroundStore = {
  paragraphs: SharedParagraph[];
  paragraph?: SharedParagraph;
  difficulty: Difficulty;
  category?: ParagraphCategory;
  loading: boolean;
  phase: PlaygroundPhase;
  typed: string;
  startedAt?: number;
  elapsedMs?: number;
  result?: TypingStats;
  loadParagraphs: () => Promise<void>;
  setDifficulty: (difficulty: Difficulty) => void;
  setCategory: (category?: ParagraphCategory) => void;
  shuffle: () => void;
  setTyped: (typed: string) => void;
  giveUp: () => void;
  retry: () => void;
  resetPlayground: () => void;
};

function matchingPool(
  pool: SharedParagraph[],
  category?: ParagraphCategory,
  difficulty?: Difficulty
) {
  const matching = pool.filter((candidate) => {
    const categoryMatches = category ? candidate.category === category : true;
    const difficultyMatches = difficulty ? candidate.difficulty === difficulty : true;
    return categoryMatches && difficultyMatches;
  });
  return matching.length ? matching : pool;
}

function pickParagraph(
  pool: SharedParagraph[],
  category?: ParagraphCategory,
  difficulty?: Difficulty
) {
  return selectParagraph({
    seed: makeMatchSeed("playground"),
    pool,
    category,
    difficulty
  });
}

function pickDifferentParagraph(
  current: SharedParagraph | undefined,
  pool: SharedParagraph[],
  category?: ParagraphCategory,
  difficulty?: Difficulty
) {
  const group = matchingPool(pool, category, difficulty);
  if (group.length === 0) {
    return current;
  }
  if (group.length === 1) {
    return group[0];
  }

  const alternatives = current ? group.filter((candidate) => candidate.id !== current.id) : group;
  const options = alternatives.length ? alternatives : group;
  return options[Math.floor(Math.random() * options.length)];
}

export const usePlaygroundStore = create<PlaygroundStore>((set, get) => ({
  paragraphs: FALLBACK_PARAGRAPHS,
  difficulty: "easy",
  loading: true,
  phase: "setup",
  typed: "",

  loadParagraphs: async () => {
    set({ loading: true });

    let pool: SharedParagraph[];
    try {
      const response = await fetch("/api/paragraphs");
      if (!response.ok) {
        pool = FALLBACK_PARAGRAPHS;
      } else {
        const payload = (await response.json()) as { paragraphs?: SharedParagraph[] };
        pool = payload?.paragraphs?.length ? payload.paragraphs : FALLBACK_PARAGRAPHS;
      }
    } catch {
      pool = FALLBACK_PARAGRAPHS;
    }

    const { category, difficulty } = get();
    set({
      paragraphs: pool,
      paragraph: pickParagraph(pool, category, difficulty),
      loading: false,
      phase: "setup",
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined
    });
  },

  setDifficulty: (difficulty) => {
    const { paragraphs, category } = get();
    set({
      difficulty,
      paragraph: pickDifferentParagraph(get().paragraph, paragraphs, category, difficulty),
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined,
      phase: "setup"
    });
  },

  setCategory: (category) => {
    const { paragraphs, difficulty } = get();
    set({
      category,
      paragraph: pickDifferentParagraph(get().paragraph, paragraphs, category, difficulty),
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined,
      phase: "setup"
    });
  },

  shuffle: () => {
    const { paragraphs, category, difficulty, paragraph } = get();
    set({
      paragraph: pickDifferentParagraph(paragraph, paragraphs, category, difficulty),
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined,
      phase: "setup"
    });
  },

  setTyped: (value) => {
    const { paragraph, startedAt, phase } = get();
    if (!paragraph || phase === "results") {
      return;
    }
    const typed = normalizeTypedValue(value, paragraph.body);
    const sessionStart = startedAt ?? Date.now();
    const stats = calculateTypingStats({
      typed,
      paragraph: paragraph.body,
      startedAt: sessionStart,
      now: Date.now()
    });
    set({
      typed,
      startedAt: sessionStart,
      elapsedMs: stats.completed ? stats.completionMs : undefined,
      result: stats.completed ? stats : undefined,
      phase: stats.completed ? "results" : "typing"
    });
  },

  giveUp: () => {
    const { paragraph, typed, startedAt, phase } = get();
    if (!paragraph || phase !== "typing") {
      return;
    }
    const sessionStart = startedAt ?? Date.now();
    const stats = calculateTypingStats({
      typed,
      paragraph: paragraph.body,
      startedAt: sessionStart,
      now: Date.now()
    });
    set({
      result: stats,
      elapsedMs: Math.max(Date.now() - sessionStart, 1),
      phase: "results"
    });
  },

  retry: () => {
    const { paragraphs, category, difficulty, paragraph } = get();
    set({
      paragraph: pickDifferentParagraph(paragraph, paragraphs, category, difficulty),
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined,
      phase: "typing"
    });
  },

  resetPlayground: () =>
    set({
      paragraphs: FALLBACK_PARAGRAPHS,
      paragraph: undefined,
      difficulty: "easy",
      category: undefined,
      loading: true,
      phase: "setup",
      typed: "",
      startedAt: undefined,
      elapsedMs: undefined,
      result: undefined
    })
}));