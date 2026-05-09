import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }

    const [{ data: profile, error: profileError }, { data: ranking, error: rankingError }] =
      await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("rankings").select("*").eq("user_id", user.id).maybeSingle()
      ]);

    if (profileError || rankingError) {
      return NextResponse.json(
        { error: profileError?.message ?? rankingError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile, ranking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as { username?: string; avatarUrl?: string };
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const username = payload.username?.trim();
    if (username && (username.length < 3 || username.length > 24)) {
      return NextResponse.json({ error: "Username must be 3-24 characters." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        ...(username ? { username } : {}),
        ...(payload.avatarUrl ? { avatar_url: payload.avatarUrl } : {})
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update profile." },
      { status: 500 }
    );
  }
}
