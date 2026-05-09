import type { Difficulty, ParagraphCategory, SharedParagraph } from "@/types/game";

export const FALLBACK_PARAGRAPHS: SharedParagraph[] = [
  {
    id: "fallback-easy-1",
    category: "easy",
    difficulty: "easy",
    body: "Neon keys shimmer under steady hands as two focused players chase the same line of text. Every clean letter moves the duel forward, and every mistake leaves a bright mark on the scoreboard.",
    estimatedSeconds: 35,
    seedTag: "fallback"
  },
  {
    id: "fallback-medium-1",
    category: "medium",
    difficulty: "medium",
    body: "A fair typing match is not won by rushing alone. It rewards calm focus, precise corrections, and the ability to keep pace while pressure rises on the other side of the arena.",
    estimatedSeconds: 45,
    seedTag: "fallback"
  },
  {
    id: "fallback-hard-1",
    category: "hard",
    difficulty: "hard",
    body: "Synchronization matters when milliseconds decide a match. A trustworthy arena validates progress on the server, compares completion, speed, accuracy, and time, then records the result without asking the browser to be honest.",
    estimatedSeconds: 62,
    seedTag: "fallback"
  },
  {
    id: "fallback-programming-1",
    category: "programming",
    difficulty: "medium",
    body: "Readable code and readable typing share the same discipline. Small mistakes compound quickly, but careful structure, clear intent, and steady feedback loops keep the system moving.",
    estimatedSeconds: 48,
    seedTag: "fallback"
  }
];

export function makeMatchSeed(prefix = "duel") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function selectParagraph(params: {
  seed: string;
  pool?: SharedParagraph[];
  category?: ParagraphCategory;
  difficulty?: Difficulty;
}) {
  const pool = params.pool?.length ? params.pool : FALLBACK_PARAGRAPHS;
  const filtered = pool.filter((paragraph) => {
    const categoryMatches = params.category ? paragraph.category === params.category : true;
    const difficultyMatches = params.difficulty ? paragraph.difficulty === params.difficulty : true;
    return categoryMatches && difficultyMatches;
  });
  const options = filtered.length ? filtered : pool;
  return options[seededIndex(params.seed, options.length)];
}

export function seededIndex(seed: string, modulo: number) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % modulo;
}
