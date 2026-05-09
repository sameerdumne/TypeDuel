import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardPlayer, RankName, SharedParagraph } from "../src/types/game";
import { divisionFromMmr, rankFromMmr } from "../src/utils/ranking";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (adminClient) {
    return adminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}

export async function verifyAccessToken(accessToken?: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase || !accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getPlayerProfile(userId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, username, avatar_url, rank")
    .eq("id", userId)
    .maybeSingle();

  const { data: ranking } = await supabase
    .from("rankings")
    .select("mmr, rank_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    username: data.username as string,
    avatarUrl: data.avatar_url as string | undefined,
    rank: ((ranking?.rank_name as RankName | undefined) ?? data.rank ?? "Bronze") as RankName,
    mmr: (ranking?.mmr as number | undefined) ?? 1000
  };
}

export async function loadParagraphPool() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("paragraphs")
    .select("id, category, difficulty, body, estimated_seconds, seed_tag")
    .eq("is_active", true);

  if (error || !data) {
    console.error("[supabase] unable to load paragraphs", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    category: row.category,
    difficulty: row.difficulty,
    body: row.body,
    estimatedSeconds: row.estimated_seconds,
    seedTag: row.seed_tag
  })) as SharedParagraph[];
}

export async function fetchLeaderboard(limit = 5) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("global_leaderboard")
    .select("*")
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as LeaderboardPlayer[];
}

export async function updateUserAfterMatch(params: {
  userId: string;
  won: boolean;
  wpm: number;
  accuracy: number;
  mmrDelta: number;
  xpDelta: number;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return;
  }

  const [{ data: user }, { data: ranking }] = await Promise.all([
    supabase
      .from("users")
      .select("matches_played, wins, losses, avg_wpm, accuracy, xp")
      .eq("id", params.userId)
      .maybeSingle(),
    supabase
      .from("rankings")
      .select("mmr, wins, losses, daily_wins, daily_wpm_best, win_streak, best_streak")
      .eq("user_id", params.userId)
      .maybeSingle()
  ]);

  const matchesPlayed = ((user?.matches_played as number | undefined) ?? 0) + 1;
  const previousMatches = Math.max(matchesPlayed - 1, 0);
  const wins = ((user?.wins as number | undefined) ?? 0) + (params.won ? 1 : 0);
  const losses = ((user?.losses as number | undefined) ?? 0) + (params.won ? 0 : 1);
  const avgWpm =
    (((user?.avg_wpm as number | undefined) ?? 0) * previousMatches + params.wpm) / matchesPlayed;
  const averageAccuracy =
    (((user?.accuracy as number | undefined) ?? 100) * previousMatches + params.accuracy) /
    matchesPlayed;
  const nextMmr = Math.max(((ranking?.mmr as number | undefined) ?? 1000) + params.mmrDelta, 0);
  const rank = rankFromMmr(nextMmr);
  const previousStreak = (ranking?.win_streak as number | undefined) ?? 0;
  const winStreak = params.won ? previousStreak + 1 : 0;
  const bestStreak = Math.max((ranking?.best_streak as number | undefined) ?? 0, winStreak);

  await Promise.all([
    supabase
      .from("users")
      .update({
        matches_played: matchesPlayed,
        wins,
        losses,
        avg_wpm: avgWpm,
        accuracy: averageAccuracy,
        xp: ((user?.xp as number | undefined) ?? 0) + params.xpDelta,
        rank,
        current_streak: winStreak,
        best_streak: bestStreak
      })
      .eq("id", params.userId),
    supabase
      .from("rankings")
      .upsert(
        {
          user_id: params.userId,
          mmr: nextMmr,
          rank_name: rank,
          division: divisionFromMmr(nextMmr),
          wins: ((ranking?.wins as number | undefined) ?? 0) + (params.won ? 1 : 0),
          losses: ((ranking?.losses as number | undefined) ?? 0) + (params.won ? 0 : 1),
          daily_wins: ((ranking?.daily_wins as number | undefined) ?? 0) + (params.won ? 1 : 0),
          daily_wpm_best: Math.max((ranking?.daily_wpm_best as number | undefined) ?? 0, params.wpm),
          win_streak: winStreak,
          best_streak: bestStreak
        },
        { onConflict: "user_id" }
      )
  ]);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
