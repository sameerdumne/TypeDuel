import type { TypingStats } from "@/types/game";

const WPM_WORD_SIZE = 5;
const MINUTE_MS = 60_000;

export function normalizeTypedValue(value: string, paragraph: string) {
  return value.replace(/\r/g, "").slice(0, paragraph.length);
}

export function calculateTypingStats(params: {
  typed: string;
  paragraph: string;
  startedAt: number;
  now: number;
  existingFlags?: string[];
}): TypingStats {
  const typed = normalizeTypedValue(params.typed, params.paragraph);
  let correctChars = 0;
  let errors = 0;

  for (let index = 0; index < typed.length; index += 1) {
    if (typed[index] === params.paragraph[index]) {
      correctChars += 1;
    } else {
      errors += 1;
    }
  }

  const elapsedMs = Math.max(params.now - params.startedAt, 1);
  const minutes = elapsedMs / MINUTE_MS;
  const rawWpm = correctChars / WPM_WORD_SIZE / minutes;
  const completed = typed.length >= params.paragraph.length;
  const accuracy = typed.length === 0 ? 100 : (correctChars / typed.length) * 100;
  const completionPercent = (typed.length / params.paragraph.length) * 100;
  const flags = new Set(params.existingFlags ?? []);

  return {
    typedLength: typed.length,
    correctChars,
    errors,
    wpm: roundStat(rawWpm),
    accuracy: roundStat(accuracy),
    completionPercent: roundStat(Math.min(completionPercent, 100)),
    completed,
    completionMs: completed ? elapsedMs : undefined,
    suspiciousFlags: Array.from(flags)
  };
}

export function compareTypedCharacters(typed: string, paragraph: string) {
  return paragraph.split("").map((character, index) => {
    const typedCharacter = typed[index];

    if (typedCharacter == null) {
      return { character, state: "pending" as const };
    }

    if (typedCharacter === character) {
      return { character, state: "correct" as const };
    }

    return { character, state: "incorrect" as const };
  });
}

export function roundStat(value: number) {
  return Math.round(value * 100) / 100;
}
