import type { RankName } from "@/types/game";

export const RANK_THRESHOLDS: Array<{ min: number; rank: RankName }> = [
  { min: 0, rank: "Bronze" },
  { min: 1150, rank: "Silver" },
  { min: 1350, rank: "Gold" },
  { min: 1600, rank: "Platinum" },
  { min: 1900, rank: "Diamond" }
];

export function rankFromMmr(mmr: number): RankName {
  return RANK_THRESHOLDS.reduce<RankName>((current, threshold) => {
    return mmr >= threshold.min ? threshold.rank : current;
  }, "Bronze");
}

export function divisionFromMmr(mmr: number) {
  const current = [...RANK_THRESHOLDS].reverse().find((threshold) => mmr >= threshold.min);
  const floor = current?.min ?? 0;
  const progress = Math.min(Math.floor((mmr - floor) / 40), 4);
  return 5 - progress;
}

export function calculateMmrDelta(params: {
  playerMmr: number;
  opponentMmr: number;
  won: boolean;
}) {
  const kFactor = 32;
  const expectedScore = 1 / (1 + 10 ** ((params.opponentMmr - params.playerMmr) / 400));
  const actualScore = params.won ? 1 : 0;
  return Math.round(kFactor * (actualScore - expectedScore));
}

export function xpForResult(params: {
  won: boolean;
  wpm: number;
  accuracy: number;
  completed: boolean;
  suspicious: boolean;
}) {
  if (params.suspicious) {
    return 0;
  }

  const completionBonus = params.completed ? 25 : 8;
  const winBonus = params.won ? 40 : 12;
  const paceBonus = Math.min(Math.floor(params.wpm / 10) * 4, 40);
  const accuracyBonus = params.accuracy >= 98 ? 20 : params.accuracy >= 94 ? 12 : 4;

  return completionBonus + winBonus + paceBonus + accuracyBonus;
}
