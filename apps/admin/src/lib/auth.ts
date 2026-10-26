import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminRole =
  | "super_admin"
  | "admin"
  | "operations"
  | "social_media"
  | "creative"
  | "logistics"
  | "volunteer"
  | "member";

export type Department = "operations" | "social_media" | "creative" | "logistics" | "general";

export type AdminStatus = "active" | "invited" | "deactivated";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
  department: Department | null;
  status: AdminStatus;
  permissions: string[];
}

const ROLE_LEVELS: Record<AdminRole, number> = {
  member: 0,
  volunteer: 1,
  logistics: 2,
  creative: 2,
  social_media: 2,
  operations: 3,
  admin: 4,
  super_admin: 5,
};

export function roleLevel(role: AdminRole): number {
  return ROLE_LEVELS[role] ?? 0;
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
    .select("role, status, department")
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
    department: (adminUser.department as Department | null) ?? null,
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
