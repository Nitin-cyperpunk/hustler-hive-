import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission, hasMinRole } from "@/lib/auth";
import { TaskDetail } from "./task-detail";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("tasks.view_assigned");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (!task) notFound();

  // Fetch comments for this task
  const { data: comments } = await supabase
    .from("task_comments")
    .select("id, task_id, author_id, content, created_at")
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  // Fetch profiles for display names
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name");

  const profileMap: Record<string, { name: string }> = {};
  for (const p of profiles ?? []) {
    profileMap[p.user_id] = {
      name: p.full_name || "Unknown",
    };
  }

  // Fetch events for event name
  const { data: events } = await supabase
    .from("events")
    .select("id, title");

  const eventMap: Record<string, string> = {};
  for (const e of events ?? []) {
    eventMap[e.id] = e.title;
  }

  // Fetch active members for reassignment select
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("user_id, role, department")
    .eq("status", "active");

  const members = (adminUsers ?? []).map((au) => ({
    user_id: au.user_id,
    name: profileMap[au.user_id]?.name ?? "Unknown",
    role: au.role,
    department: au.department,
  }));

  const isAdmin = hasMinRole(session.role, "admin");
  const isAssignee = task.assigned_to === session.userId;
  const canAssign = session.permissions.includes("tasks.assign");
  const canDelete = session.permissions.includes("tasks.delete");

  return (
    <TaskDetail
      task={task}
      comments={comments ?? []}
      profileMap={profileMap}
      eventMap={eventMap}
      members={members ?? []}
      session={{
        userId: session.userId,
        role: session.role,
        permissions: session.permissions,
      }}
      isAdmin={isAdmin}
      isAssignee={isAssignee}
      canAssign={canAssign}
      canDelete={canDelete}
    />
  );
}
