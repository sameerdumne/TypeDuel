import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST() {
  try {
    const serverSupabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in to create persistent rooms." }, { status: 401 });
    }

    const code = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
    const serviceSupabase = createSupabaseServiceClient();
    const supabase = serviceSupabase ?? serverSupabase;
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_user_id: user.id,
        status: "waiting"
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ room: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create room." },
      { status: 500 }
    );
  }
}
