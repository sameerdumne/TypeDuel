import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("paragraphs")
      .select("id, category, difficulty, body, character_count, estimated_seconds, seed_tag")
      .eq("is_active", true)
      .order("difficulty", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ paragraphs: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load paragraphs." },
      { status: 500 }
    );
  }
}
