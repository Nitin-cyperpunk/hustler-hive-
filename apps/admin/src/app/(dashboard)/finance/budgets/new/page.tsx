import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BudgetForm } from "./budget-form";

export default async function NewBudgetPage() {
  await requirePermission("budgets.create");
  const supabase = await createServerSupabaseClient();

  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  const events = (rawEvents ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
  }));

  return <BudgetForm events={events} />;
}
