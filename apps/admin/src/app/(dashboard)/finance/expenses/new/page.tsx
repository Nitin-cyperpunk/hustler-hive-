import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExpenseForm } from "./expense-form";

export default async function NewExpensePage() {
  await requirePermission("expenses.submit");
  const supabase = await createServerSupabaseClient();

  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  const events = (rawEvents ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
  }));

  return <ExpenseForm events={events} />;
}
