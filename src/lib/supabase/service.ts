import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!env.supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(env.supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
