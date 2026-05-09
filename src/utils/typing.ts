import type { TypingStats } from "@/types/game";

const WPM_WORD_SIZE = 5;
const MINUTE_MS = 60_000;
const MAX_REASONABLE_WPM = 260;

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
  const completed = typed.length === params.paragraph.length && errors === 0;
  const accuracy = typed.length === 0 ? 100 : (correctChars / typed.length) * 100;
  const completionPercent = (typed.length / params.paragraph.length) * 100;
  const flags = new Set(params.existingFlags ?? []);

  if (rawWpm > MAX_REASONABLE_WPM && elapsedMs > 1_500) {
    flags.add("wpm_spike");
  }

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

export function validateTypingUpdate(params: {
  previousTypedLength: number;
  nextTypedLength: number;
  previousUpdateAt: number;
  now: number;
  currentFlags: string[];
}) {
  const deltaChars = params.nextTypedLength - params.previousTypedLength;
  const deltaMs = Math.max(params.now - params.previousUpdateAt, 1);
  const flags = new Set(params.currentFlags);

  if (deltaChars > 24 && deltaMs < 750) {
    flags.add("paste_like_burst");
  }

  if (deltaChars > 0) {
    const charsPerSecond = deltaChars / (deltaMs / 1000);
    if (charsPerSecond > 35) {
      flags.add("impossible_keystroke_rate");
    }
  }

  if (deltaChars < -40) {
    flags.add("large_rollback");
  }

  return {
    accepted: !flags.has("impossible_keystroke_rate"),
    suspiciousFlags: Array.from(flags)
  };
}

export function roundStat(value: number) {
  return Math.round(value * 100) / 100;
}
