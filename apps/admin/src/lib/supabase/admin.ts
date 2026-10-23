import { createSupabaseClient } from "@hustlers-hive/shared/supabase/ssr";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@hustlers-hive/shared/supabase/env";
import type { Database } from "@hustlers-hive/shared";

export function createServiceRoleClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
