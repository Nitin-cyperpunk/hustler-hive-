import { createServerClient } from "@hustlers-hive/shared/supabase/ssr";
import { SupabaseClient } from "@hustlers-hive/shared/supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrl, getSupabaseAnonKey } from "@hustlers-hive/shared/supabase/env";
import type { Database } from "@hustlers-hive/shared";

export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Can throw in Server Components (read-only cookies).
          // Session will refresh via middleware instead.
        }
      },
    },
  });
}
