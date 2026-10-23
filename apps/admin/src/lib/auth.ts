import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "core_team" | "volunteer" | "member";

export type AdminStatus = "active" | "invited" | "deactivated";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  permissions: string[];
}

const ROLE_HIERARCHY: AdminRole[] = ["member", "volunteer", "core_team", "super_admin"];

export function roleLevel(role: AdminRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

export function hasMinRole(userRole: AdminRole, minRole: AdminRole): boolean {
  return roleLevel(userRole) >= roleLevel(minRole);
}

export async function requireAdmin(minRole: AdminRole = "volunteer"): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, status")
    .eq("user_id", user.id)
    .single();

  if (!adminUser || adminUser.status !== "active") {
    redirect("/login");
  }

  const role = adminUser.role as AdminRole;

  if (!hasMinRole(role, minRole)) {
    redirect("/login");
  }

  const { data: perms } = await supabase
    .from("role_permissions")
    .select("permission")
    .eq("role", role);

  const permissions = (perms ?? []).map((p) => p.permission);

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
    status: adminUser.status as AdminStatus,
    permissions,
  };
}

export async function requirePermission(permission: string): Promise<AdminSession> {
  const session = await requireAdmin("member");

  if (!session.permissions.includes(permission)) {
    redirect("/login");
  }

  return session;
}
