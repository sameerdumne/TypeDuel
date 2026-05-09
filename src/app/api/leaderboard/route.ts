import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 50);
    const scope = searchParams.get("scope") === "daily" ? "daily_leaderboard" : "global_leaderboard";
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.from(scope).select("*").limit(limit);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ players: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load leaderboard." },
      { status: 500 }
    );
  }
}
