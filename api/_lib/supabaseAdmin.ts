import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "./env.js";

export function createSupabaseAdminClient() {
  if (!serverEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) {
    return null;
  }

  return createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function safeInsert(table: string, values: Record<string, unknown>) {
  const client = createSupabaseAdminClient();
  if (!client) return { ok: false as const, reason: "missing_supabase_env" };

  const result = await client.from(table).insert(values);
  if (result.error) {
    return { ok: false as const, reason: result.error.message };
  }

  return { ok: true as const };
}
