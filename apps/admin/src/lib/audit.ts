import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@hustlers-hive/shared";

interface AuditEntry {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, Json | undefined>;
}

export async function writeAuditLog(
  actorId: string,
  entry: AuditEntry,
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
  });

  if (error) {
    console.error("Failed to write audit log:", error.message);
  }
}
