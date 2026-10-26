import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission, hasMinRole } from "@/lib/auth";
import { TasksClient } from "./tasks-client";

export default async function TasksPage() {
  const session = await requirePermission("tasks.view_assigned");
  const supabase = await createServerSupabaseClient();

  const isAdmin = hasMinRole(session.role, "admin");

  // Build the tasks query based on role
  let tasksQuery = supabase
    .from("tasks")
    .select("id, title, description, department, assigned_to, created_by, priority, status, due_date, event_id, is_claimable, evidence, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    // Non-admin users see their own tasks + tasks in their department + claimable tasks
    tasksQuery = tasksQuery.or(
      `assigned_to.eq.${session.userId},created_by.eq.${session.userId}${session.department ? `,department.eq.${session.department}` : ""},is_claimable.eq.true`
    );
  }

  const { data: tasks } = await tasksQuery;

  // Fetch profiles for assignee names
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name");

  // Fetch events for event name display
  const { data: events } = await supabase
    .from("events")
    .select("id, title");

  // Build lookup maps
  const profileMap: Record<string, { name: string }> = {};
  for (const p of profiles ?? []) {
    profileMap[p.user_id] = {
      name: p.full_name || "Unknown",
    };
  }

  const eventMap: Record<string, string> = {};
  for (const e of events ?? []) {
    eventMap[e.id] = e.title;
  }

  return (
    <TasksClient
      tasks={tasks ?? []}
      profileMap={profileMap}
      eventMap={eventMap}
      session={{
        userId: session.userId,
        role: session.role,
        department: session.department,
        permissions: session.permissions,
      }}
    />
  );
}
