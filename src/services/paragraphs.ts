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
    id: "fallback-easy-2",
    category: "easy",
    difficulty: "easy",
    body: "Cold morning air settles over the field as the sun clears the treeline. Dew pulls slowly from the grass, birds start one by one, and the whole valley wakes up quieter than it slept.",
    estimatedSeconds: 34,
    seedTag: "fallback"
  },
  {
    id: "fallback-easy-3",
    category: "easy",
    difficulty: "easy",
    body: "Onions hit the oil with a hiss and the whole kitchen turns warm. Bread goes golden, stock drops low, and by evening the table smells like someone actually planned their afternoon.",
    estimatedSeconds: 33,
    seedTag: "fallback"
  },
  {
    id: "fallback-medium-1",
    category: "medium",
    difficulty: "medium",
    body: "A fair typing match is not won by rushing alone. It rewards calm focus, precise corrections, and the ability to keep pace while pressure rises on the other side of the arena.",
    estimatedSeconds: 38,
    seedTag: "fallback"
  },
  {
    id: "fallback-medium-2",
    category: "medium",
    difficulty: "medium",
    body: "Light leaves a distant star in 1929 and arrives eight years later, which is strange until the numbers are laid out. Everything you see tonight already left before you were born.",
    estimatedSeconds: 38,
    seedTag: "fallback"
  },
  {
    id: "fallback-medium-3",
    category: "medium",
    difficulty: "medium",
    body: "The race is decided in the final lap, not the first sprint. Runners who hold back early still have legs at the line, and runners who spend everything at the whistle have nothing left to spend.",
    estimatedSeconds: 42,
    seedTag: "fallback"
  },
  {
    id: "fallback-programming-1",
    category: "programming",
    difficulty: "medium",
    body: "Readable code and readable typing share the same discipline. Small mistakes compound quickly, but careful structure, clear intent, and steady feedback loops keep the system moving.",
    estimatedSeconds: 39,
    seedTag: "fallback"
  },
  {
    id: "fallback-programming-2",
    category: "programming",
    difficulty: "medium",
    body: "A stack trace is a story told backwards. The frame where it broke sits at the very top, and the careless line that started everything waits patiently at the bottom, three hundred lines down.",
    estimatedSeconds: 41,
    seedTag: "fallback"
  },
  {
    id: "fallback-random-1",
    category: "random",
    difficulty: "medium",
    body: "Some matches feel like lightning in a quiet room. The countdown fades, the first character glows, and suddenly two strangers are racing through the exact same thought.",
    estimatedSeconds: 36,
    seedTag: "fallback"
  },
  {
    id: "fallback-random-2",
    category: "random",
    difficulty: "medium",
    body: "Nobody planned the queue. The bakery opens, the rain starts, and suddenly strangers are sharing one umbrella and the same furious opinion about a football match as if they had been waiting all week.",
    estimatedSeconds: 40,
    seedTag: "fallback"
  },
  {
    id: "fallback-hard-1",
    category: "hard",
    difficulty: "hard",
    body: "Synchronization matters when milliseconds decide a match. A trustworthy arena validates progress on the server, compares completion, speed, accuracy, and time, then records the result without asking the browser to be honest.",
    estimatedSeconds: 64,
    seedTag: "fallback"
  },
  {
    id: "fallback-hard-2",
    category: "hard",
    difficulty: "hard",
    body: "Two surgeons, eleven years apart in training, both reach for the same clamp. Outside, monitors argue with themselves, a nurse counts aloud, and somewhere in the building a train leaves the station on time.",
    estimatedSeconds: 59,
    seedTag: "fallback"
  },
  {
    id: "fallback-hard-3",
    category: "hard",
    difficulty: "hard",
    body: "Every distributed system makes a bargain with failure: it accepts that a message will be delayed, duplicated, or lost, then pays for that certainty with retries, idempotency keys, and reconciliation loops nobody remembers agreeing to.",
    estimatedSeconds: 67,
    seedTag: "fallback"
  },
  {
    id: "fallback-programming-3",
    category: "programming",
    difficulty: "hard",
    body: "Two transactions grab the same row and one of them waits, silently, on a lock that will not be released until a request which already failed is finally cleaned up. The database is behaving correctly. The bug is a promise nobody cancelled.",
    estimatedSeconds: 65,
    seedTag: "fallback"
  },
  {
    id: "fallback-programming-4",
    category: "programming",
    difficulty: "hard",
    body: "A type system is a bargain you make with the compiler: prove the shape of your data once and every function downstream is allowed to assume it. Get the proof wrong and the error surfaces three modules away, on somebody else's Monday.",
    estimatedSeconds: 63,
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
