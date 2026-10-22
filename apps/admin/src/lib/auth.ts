import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "editor";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
}

export async function requireAdmin(minRole: AdminRole = "editor"): Promise<AdminSession> {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!adminUser) {
    redirect("/login");
  }

  const role = adminUser.role as AdminRole;
  const hierarchy: AdminRole[] = ["editor", "admin", "super_admin"];
  const userLevel = hierarchy.indexOf(role);
  const requiredLevel = hierarchy.indexOf(minRole);

  if (userLevel < requiredLevel) {
    redirect("/login");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role,
  };
}
