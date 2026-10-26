"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit";

export async function inviteTeamMember(formData: FormData) {
  const session = await requirePermission("users.invite");
  const supabase = await createServerSupabaseClient();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const fullName = (formData.get("full_name") as string)?.trim();
  const role = formData.get("role") as string;

  if (!email || !fullName || !role) {
    return { error: "Email, name, and role are required." };
  }

  if (!["admin", "operations", "social_media", "creative", "logistics", "volunteer", "member"].includes(role)) {
    return { error: "Invalid role." };
  }

  const { data: existing } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", email)
    .eq("status", "pending")
    .single();

  if (existing) {
    return { error: "A pending invitation already exists for this email." };
  }

  const adminClient = createServiceRoleClient();

  const { data: existingUsers } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existingUser = existingUsers?.users.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email,
  );
  if (existingUser) {
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role, status")
      .eq("user_id", existingUser.id)
      .single();

    if (adminRow) {
      return {
        error: `This email already belongs to a team member (role: ${adminRow.role}, status: ${adminRow.status}).`,
      };
    }
  }

  const { data: invitation, error: invError } = await supabase
    .from("invitations")
    .insert({
      email,
      full_name: fullName,
      role: role as "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member",
      invited_by: session.userId,
    })
    .select("id")
    .single();

  if (invError) {
    if (invError.code === "23505") {
      return { error: "A pending invitation already exists for this email." };
    }
    return { error: invError.message };
  }

  const { data: invitedUser, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, invited_role: role },
    });

  if (inviteError) {
    await supabase
      .from("invitations")
      .update({ status: "revoked" })
      .eq("id", invitation.id);
    return {
      error: `Failed to send invitation email: ${inviteError.message}`,
    };
  }

  if (invitedUser?.user) {
    await adminClient.from("profiles").upsert({
      user_id: invitedUser.user.id,
      full_name: fullName,
    });

    await adminClient.from("admin_users").upsert({
      user_id: invitedUser.user.id,
      role: role as "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member",
      status: "invited",
    });

    await supabase
      .from("invitations")
      .update({ accepted_by: invitedUser.user.id })
      .eq("id", invitation.id);
  }

  await writeAuditLog(session.userId, {
    action: "invitation.created",
    targetType: "invitation",
    targetId: invitation.id,
    metadata: { email, role, full_name: fullName },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function revokeInvitation(invitationId: string) {
  const session = await requirePermission("users.invite");
  const supabase = await createServerSupabaseClient();

  const { data: inv } = await supabase
    .from("invitations")
    .select("id, email, status")
    .eq("id", invitationId)
    .single();

  if (!inv || inv.status !== "pending") {
    return { error: "Invitation not found or already processed." };
  }

  const { error } = await supabase
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "invitation.revoked",
    targetType: "invitation",
    targetId: invitationId,
    metadata: { email: inv.email },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function changeTeamMemberRole(
  targetUserId: string,
  newRole: string,
) {
  const session = await requirePermission("users.update_role");
  const supabase = await createServerSupabaseClient();

  if (!["admin", "operations", "social_media", "creative", "logistics", "volunteer", "member"].includes(newRole)) {
    return { error: "Invalid role." };
  }

  if (targetUserId === session.userId) {
    return { error: "You cannot change your own role." };
  }

  const { data: target } = await supabase
    .from("admin_users")
    .select("role, status")
    .eq("user_id", targetUserId)
    .single();

  if (!target) {
    return { error: "Team member not found." };
  }

  if (target.role === "super_admin") {
    return { error: "Cannot change the role of a Super Admin." };
  }

  if (target.role === newRole) {
    return { error: "Role is already set to this value." };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ role: newRole as "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member" })
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "role.changed",
    targetType: "user",
    targetId: targetUserId,
    metadata: { old_role: target.role, new_role: newRole },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function deactivateTeamMember(targetUserId: string) {
  const session = await requirePermission("users.deactivate");
  const supabase = await createServerSupabaseClient();

  if (targetUserId === session.userId) {
    return { error: "You cannot deactivate yourself." };
  }

  const { data: target } = await supabase
    .from("admin_users")
    .select("role, status")
    .eq("user_id", targetUserId)
    .single();

  if (!target) {
    return { error: "Team member not found." };
  }

  if (target.role === "super_admin") {
    const { count } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("status", "active");

    if ((count ?? 0) <= 1) {
      return {
        error: "Cannot deactivate the last active Super Admin.",
      };
    }
  }

  if (target.status === "deactivated") {
    return { error: "This member is already deactivated." };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ status: "deactivated" })
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "user.deactivated",
    targetType: "user",
    targetId: targetUserId,
    metadata: { role: target.role },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function reactivateTeamMember(targetUserId: string) {
  const session = await requirePermission("users.deactivate");
  const supabase = await createServerSupabaseClient();

  const { data: target } = await supabase
    .from("admin_users")
    .select("role, status")
    .eq("user_id", targetUserId)
    .single();

  if (!target) {
    return { error: "Team member not found." };
  }

  if (target.status !== "deactivated") {
    return { error: "This member is not deactivated." };
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ status: "active" })
    .eq("user_id", targetUserId);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "user.reactivated",
    targetType: "user",
    targetId: targetUserId,
    metadata: { role: target.role },
  });

  revalidatePath("/team");
  return { success: true };
}
