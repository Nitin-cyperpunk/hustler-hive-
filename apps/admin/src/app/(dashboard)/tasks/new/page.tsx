import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { createTask } from "../actions";
import { TaskForm } from "./task-form";

export default async function NewTaskPage() {
  await requirePermission("tasks.create");
  const supabase = await createServerSupabaseClient();

  // Fetch active admin users
  const { data: adminUsers } = await supabase
    .from("admin_users")
    .select("user_id, role, department")
    .eq("status", "active");

  // Fetch profiles for names
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name");

  const profileLookup: Record<string, string> = {};
  for (const p of profiles ?? []) {
    profileLookup[p.user_id] = p.full_name || "Unknown";
  }

  const members = (adminUsers ?? []).map((au) => ({
    user_id: au.user_id,
    name: profileLookup[au.user_id] ?? "Unknown",
    role: au.role,
    department: au.department,
  }));

  // Fetch events for linking
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-brand-text">Create Task</h1>
      <TaskForm
        action={createTask}
        members={members ?? []}
        events={events ?? []}
      />
    </div>
  );
}
