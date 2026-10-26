"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, requirePermission, hasMinRole } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function createTask(formData: FormData) {
  const session = await requirePermission("tasks.create");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const department = (formData.get("department") as string) || null;
  const assigned_to = (formData.get("assigned_to") as string) || null;
  const priority = (formData.get("priority") as string) || "medium";
  const due_date = (formData.get("due_date") as string) || null;
  const event_id = (formData.get("event_id") as string) || null;
  const is_claimable = formData.get("is_claimable") === "on";

  if (!title) return { error: "Title is required." };

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    department: department as "operations" | "social_media" | "creative" | "logistics" | "general" | null,
    assigned_to: assigned_to || null,
    created_by: session.userId,
    priority: priority as "low" | "medium" | "high" | "urgent",
    due_date: due_date || null,
    event_id: event_id || null,
    is_claimable,
  });

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "task.create",
    targetType: "task",
    metadata: { title, department, priority },
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function updateTask(id: string, formData: FormData) {
  const session = await requireAdmin("volunteer");
  const supabase = await createServerSupabaseClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("assigned_to, created_by, status")
    .eq("id", id)
    .single();

  if (!task) return { error: "Task not found." };

  const isAdmin = hasMinRole(session.role, "admin");
  const isAssignee = task.assigned_to === session.userId;

  if (!isAdmin && !isAssignee) {
    return { error: "You do not have permission to update this task." };
  }

  if (isAdmin) {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const department = (formData.get("department") as string) || null;
    const assigned_to = (formData.get("assigned_to") as string) || null;
    const priority = (formData.get("priority") as string) || "medium";
    const status = (formData.get("status") as string) || task.status;
    const due_date = (formData.get("due_date") as string) || null;
    const event_id = (formData.get("event_id") as string) || null;
    const is_claimable = formData.get("is_claimable") === "on";
    const evidence = (formData.get("evidence") as string)?.trim() || null;

    if (!title) return { error: "Title is required." };

    const { error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        department: department as "operations" | "social_media" | "creative" | "logistics" | "general" | null,
        assigned_to: assigned_to || null,
        priority: priority as "low" | "medium" | "high" | "urgent",
        status: status as "todo" | "in_progress" | "blocked" | "in_review" | "completed" | "cancelled",
        due_date: due_date || null,
        event_id: event_id || null,
        is_claimable,
        evidence,
      })
      .eq("id", id);

    if (error) return { error: error.message };
  } else {
    const status = (formData.get("status") as string) || task.status;
    const evidence = (formData.get("evidence") as string)?.trim() || null;

    const { error } = await supabase
      .from("tasks")
      .update({
        status: status as "todo" | "in_progress" | "blocked" | "in_review" | "completed" | "cancelled",
        evidence,
      })
      .eq("id", id);

    if (error) return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "task.update",
    targetType: "task",
    targetId: id,
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  return { success: true };
}

export async function deleteTask(id: string) {
  const session = await requireAdmin("admin");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "task.delete",
    targetType: "task",
    targetId: id,
  });

  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function addTaskComment(taskId: string, content: string) {
  const session = await requireAdmin("member");
  const supabase = await createServerSupabaseClient();

  const trimmed = content?.trim();
  if (!trimmed) return { error: "Comment cannot be empty." };

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: session.userId,
    content: trimmed,
  });

  if (error) return { error: error.message };

  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

export async function claimTask(taskId: string) {
  const session = await requirePermission("tasks.update_assigned");
  const supabase = await createServerSupabaseClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("id, is_claimable, assigned_to, title")
    .eq("id", taskId)
    .single();

  if (!task) return { error: "Task not found." };
  if (!task.is_claimable) return { error: "This task is not open for claiming." };
  if (task.assigned_to) return { error: "This task has already been claimed." };

  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: session.userId, is_claimable: false })
    .eq("id", taskId);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "task.claimed",
    targetType: "task",
    targetId: taskId,
    metadata: { title: task.title },
  });

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}
