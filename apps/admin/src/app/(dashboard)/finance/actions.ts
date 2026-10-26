"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

/* ---------- Budgets ---------- */

export async function createBudget(formData: FormData) {
  const session = await requirePermission("budgets.create");
  const supabase = await createServerSupabaseClient();

  const event_id = (formData.get("event_id") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const proposed_amount = parseFloat(formData.get("proposed_amount") as string);
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!event_id || !category || isNaN(proposed_amount) || proposed_amount < 0) {
    return { error: "Event, category, and a valid proposed amount are required." };
  }

  const { data: budget, error } = await supabase
    .from("event_budgets")
    .insert({
      event_id,
      category,
      proposed_amount,
      notes,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A budget for this event and category already exists." };
    }
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "budget.created",
    targetType: "event_budget",
    targetId: budget.id,
    metadata: { event_id, category, proposed_amount },
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function approveBudget(
  id: string,
  approved_amount: number,
  spending_limit: number | null,
) {
  const session = await requirePermission("budgets.approve");
  const supabase = await createServerSupabaseClient();

  if (isNaN(approved_amount) || approved_amount < 0) {
    return { error: "A valid approved amount is required." };
  }

  const { data: budget } = await supabase
    .from("event_budgets")
    .select("id, approval_status")
    .eq("id", id)
    .single();

  if (!budget) {
    return { error: "Budget not found." };
  }

  if (budget.approval_status !== "pending") {
    return { error: "Only pending budgets can be approved." };
  }

  const { error } = await supabase
    .from("event_budgets")
    .update({
      approved_amount,
      spending_limit: spending_limit ?? approved_amount,
      approval_status: "approved",
      approved_by: session.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "budget.approved",
    targetType: "event_budget",
    targetId: id,
    metadata: { approved_amount, spending_limit },
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function rejectBudget(id: string, reason: string) {
  const session = await requirePermission("budgets.approve");
  const supabase = await createServerSupabaseClient();

  if (!reason?.trim()) {
    return { error: "A reason is required when rejecting a budget." };
  }

  const { data: budget } = await supabase
    .from("event_budgets")
    .select("id, approval_status")
    .eq("id", id)
    .single();

  if (!budget) {
    return { error: "Budget not found." };
  }

  if (budget.approval_status !== "pending") {
    return { error: "Only pending budgets can be rejected." };
  }

  const { error } = await supabase
    .from("event_budgets")
    .update({
      approval_status: "rejected",
      notes: reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "budget.rejected",
    targetType: "event_budget",
    targetId: id,
    metadata: { reason: reason.trim() },
  });

  revalidatePath("/finance");
  return { success: true };
}

/* ---------- Expenses ---------- */

export async function createExpense(formData: FormData) {
  const session = await requirePermission("expenses.submit");
  const supabase = await createServerSupabaseClient();

  const event_id = (formData.get("event_id") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const amount = parseFloat(formData.get("amount") as string);
  const expense_date = (formData.get("expense_date") as string)?.trim();
  const vendor = (formData.get("vendor") as string)?.trim() || null;
  const payment_method = (formData.get("payment_method") as string)?.trim() || null;
  const submitNow = formData.get("submit_now") === "true";

  if (!category || !description || isNaN(amount) || amount <= 0 || !expense_date) {
    return { error: "Category, description, a positive amount, and date are required." };
  }

  const validPaymentMethods = ["cash", "upi", "bank_transfer", "card", "other"];
  if (payment_method && !validPaymentMethods.includes(payment_method)) {
    return { error: "Invalid payment method." };
  }

  // Handle receipt upload
  let receipt_storage_path: string | null = null;
  const receipt = formData.get("receipt") as File | null;
  if (receipt && receipt.size > 0) {
    const ext = receipt.name.split(".").pop() ?? "file";
    const path = `${session.userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, receipt);

    if (uploadError) {
      return { error: `Receipt upload failed: ${uploadError.message}` };
    }
    receipt_storage_path = path;
  }

  // If event is selected, look up the matching budget
  let budget_id: string | null = null;
  if (event_id) {
    const { data: matchingBudget } = await supabase
      .from("event_budgets")
      .select("id")
      .eq("event_id", event_id)
      .eq("category", category)
      .eq("approval_status", "approved")
      .single();

    if (matchingBudget) {
      budget_id = matchingBudget.id;
    }
  }

  const status = submitNow ? "submitted" : "draft";

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      event_id,
      budget_id,
      category,
      description,
      amount,
      expense_date,
      vendor,
      receipt_storage_path,
      payment_method: payment_method as
        | "cash"
        | "upi"
        | "bank_transfer"
        | "card"
        | "other"
        | null,
      incurred_by: session.userId,
      submitted_by: session.userId,
      status,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: submitNow ? "expense.submitted" : "expense.created",
    targetType: "expense",
    targetId: expense.id,
    metadata: { category, amount, event_id, status },
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function submitExpense(id: string) {
  const session = await requirePermission("expenses.submit");
  const supabase = await createServerSupabaseClient();

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, status, submitted_by")
    .eq("id", id)
    .single();

  if (!expense) {
    return { error: "Expense not found." };
  }

  if (expense.submitted_by !== session.userId) {
    return { error: "Only the submitter can submit this expense." };
  }

  if (expense.status !== "draft") {
    return { error: "Only draft expenses can be submitted." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "expense.submitted",
    targetType: "expense",
    targetId: id,
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function reviewExpense(
  id: string,
  decision: "approved" | "rejected",
  reason: string | null,
) {
  const session = await requirePermission("expenses.approve");
  const supabase = await createServerSupabaseClient();

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, status, submitted_by")
    .eq("id", id)
    .single();

  if (!expense) {
    return { error: "Expense not found." };
  }

  if (expense.status !== "submitted" && expense.status !== "under_review") {
    return { error: "Only submitted or under-review expenses can be reviewed." };
  }

  // Self-approval guard (DB trigger also enforces this)
  if (expense.submitted_by === session.userId) {
    return { error: "You cannot review your own expense." };
  }

  if (decision === "rejected" && !reason?.trim()) {
    return { error: "A reason is required when rejecting an expense." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      status: decision,
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
      review_reason: reason?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: `expense.${decision}`,
    targetType: "expense",
    targetId: id,
    metadata: { decision, reason: reason?.trim() ?? undefined },
  });

  revalidatePath("/finance");
  return { success: true };
}

export async function markReimbursed(id: string) {
  const session = await requirePermission("expenses.approve");
  const supabase = await createServerSupabaseClient();

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!expense) {
    return { error: "Expense not found." };
  }

  if (expense.status !== "approved") {
    return { error: "Only approved expenses can be marked as reimbursed." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      status: "reimbursed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "expense.reimbursed",
    targetType: "expense",
    targetId: id,
  });

  revalidatePath("/finance");
  return { success: true };
}
