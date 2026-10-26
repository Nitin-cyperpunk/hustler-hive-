import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { FinanceClient } from "./finance-client";

export default async function FinancePage() {
  const session = await requirePermission("budgets.view");
  const supabase = await createServerSupabaseClient();

  /* ---------- Fetch budgets with event title ---------- */
  const { data: rawBudgets } = await supabase
    .from("event_budgets")
    .select("id, event_id, category, proposed_amount, approved_amount, spending_limit, approval_status, notes, created_at, events(title)")
    .order("created_at", { ascending: false });

  const budgets = (rawBudgets ?? []).map((b) => ({
    id: b.id,
    event_id: b.event_id,
    event_title: (b.events as unknown as { title: string } | null)?.title ?? "Unknown event",
    category: b.category,
    proposed_amount: Number(b.proposed_amount),
    approved_amount: b.approved_amount != null ? Number(b.approved_amount) : null,
    spending_limit: b.spending_limit != null ? Number(b.spending_limit) : null,
    approval_status: b.approval_status,
    notes: b.notes,
    created_at: b.created_at,
  }));

  /* ---------- Fetch expenses with event title & submitter name ---------- */
  const { data: rawExpenses } = await supabase
    .from("expenses")
    .select("id, event_id, category, description, amount, expense_date, vendor, payment_method, status, submitted_by, created_at, events(title)")
    .order("created_at", { ascending: false });

  const submitterIds = [
    ...new Set((rawExpenses ?? []).map((e) => e.submitted_by)),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", submitterIds.length > 0 ? submitterIds : ["__none__"]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name ?? "Unknown"]),
  );

  const expenses = (rawExpenses ?? []).map((e) => ({
    id: e.id,
    event_id: e.event_id,
    event_title: (e.events as unknown as { title: string } | null)?.title ?? null,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    expense_date: e.expense_date,
    vendor: e.vendor,
    payment_method: e.payment_method,
    status: e.status,
    submitted_by: e.submitted_by,
    submitter_name: profileMap.get(e.submitted_by) ?? "Unknown",
    created_at: e.created_at,
  }));

  /* ---------- Fetch events for filters ---------- */
  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  const events = (rawEvents ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
  }));

  /* ---------- Stats ---------- */
  const totalProposed = budgets.reduce((sum, b) => sum + b.proposed_amount, 0);
  const totalApproved = budgets
    .filter((b) => b.approval_status === "approved")
    .reduce((sum, b) => sum + (b.approved_amount ?? 0), 0);
  const totalSpent = expenses
    .filter((e) => e.status === "approved" || e.status === "reimbursed")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingExpensesCount = expenses.filter(
    (e) => e.status === "submitted" || e.status === "under_review",
  ).length;

  function formatINR(n: number): string {
    return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-brand-text">Finance & Expenses</h1>
        <p className="text-sm text-brand-muted">
          Manage event budgets, track expenses, and process reimbursements
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Total Proposed
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-text">
              {formatINR(totalProposed)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Total Approved
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-cyan">
              {formatINR(totalApproved)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Total Spent
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-text">
              {formatINR(totalSpent)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Pending Expenses
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-text">
              {pendingExpensesCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client tabs */}
      <FinanceClient
        session={session}
        budgets={budgets}
        expenses={expenses}
        events={events}
      />
    </div>
  );
}
