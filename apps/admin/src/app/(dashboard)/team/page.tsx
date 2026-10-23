import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TeamClient } from "./team-client";

export default async function TeamPage() {
  const session = await requirePermission("users.view");
  const supabase = await createServerSupabaseClient();

  const { data: members } = await supabase
    .from("admin_users")
    .select("user_id, role, status, created_at, updated_at")
    .order("created_at", { ascending: true });

  const userIds = (members ?? []).map((m) => m.user_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url")
    .in("user_id", userIds.length > 0 ? userIds : ["__none__"]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p]),
  );

  const teamMembers = (members ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role,
    status: m.status,
    createdAt: m.created_at,
    fullName: profileMap.get(m.user_id)?.full_name ?? "Unknown",
    avatarUrl: profileMap.get(m.user_id)?.avatar_url ?? null,
  }));

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, role, full_name, status, expires_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <TeamClient
      session={session}
      members={teamMembers}
      invitations={invitations ?? []}
    />
  );
}
