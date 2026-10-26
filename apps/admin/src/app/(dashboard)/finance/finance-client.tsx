"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Banknote,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  approveBudget,
  rejectBudget,
  submitExpense,
  reviewExpense,
  markReimbursed,
} from "./actions";

/* ---------- Types ---------- */

interface BudgetRow {
  id: string;
  event_id: string;
  event_title: string;
  category: string;
  proposed_amount: number;
  approved_amount: number | null;
  spending_limit: number | null;
  approval_status: string;
  notes: string | null;
  created_at: string;
}

interface ExpenseRow {
  id: string;
  event_id: string | null;
  event_title: string | null;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor: string | null;
  payment_method: string | null;
  status: string;
  submitted_by: string;
  submitter_name: string;
  created_at: string;
}

interface EventOption {
  id: string;
  title: string;
}

/* ---------- Helpers ---------- */

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "draft" | "published";

function budgetStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "pending":
    default:
      return "secondary";
  }
}

function expenseStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "destructive";
    case "submitted":
      return "outline";
    case "under_review":
      return "secondary";
    case "reimbursed":
      return "default";
    case "draft":
    default:
      return "draft";
  }
}

/* ---------- Component ---------- */

export function FinanceClient({
  session,
  budgets,
  expenses,
  events,
}: {
  session: AdminSession;
  budgets: BudgetRow[];
  expenses: ExpenseRow[];
  events: EventOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [budgetEventFilter, setBudgetEventFilter] = useState("all");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState("all");
  const [expenseEventFilter, setExpenseEventFilter] = useState("all");
  const [expenseSearch, setExpenseSearch] = useState("");

  // Dialogs
  const [approveTarget, setApproveTarget] = useState<BudgetRow | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; type: "budget" | "expense" } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState<ExpenseRow | null>(null);

  const canCreateBudget = session.permissions.includes("budgets.create");
  const canApproveBudget = session.permissions.includes("budgets.approve");
  const canSubmitExpense = session.permissions.includes("expenses.submit");
  const canApproveExpense = session.permissions.includes("expenses.approve");

  // Budget filtering
  const filteredBudgets = budgets.filter((b) => {
    if (budgetEventFilter !== "all" && b.event_id !== budgetEventFilter) return false;
    return true;
  });

  // Expense filtering
  const filteredExpenses = expenses.filter((e) => {
    if (expenseStatusFilter !== "all" && e.status !== expenseStatusFilter) return false;
    if (expenseEventFilter !== "all" && e.event_id !== expenseEventFilter) return false;
    if (expenseSearch) {
      const q = expenseSearch.toLowerCase();
      if (
        !e.description.toLowerCase().includes(q) &&
        !e.category.toLowerCase().includes(q) &&
        !(e.vendor?.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  /* -- Budget approve handler -- */
  function handleApproveBudget() {
    if (!approveTarget) return;
    const amt = parseFloat(approvedAmount);
    const limit = spendingLimit ? parseFloat(spendingLimit) : null;
    if (isNaN(amt) || amt < 0) {
      setError("Enter a valid approved amount.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await approveBudget(approveTarget.id, amt, limit);
      if (result.error) {
        setError(result.error);
      } else {
        setApproveTarget(null);
        setApprovedAmount("");
        setSpendingLimit("");
        router.refresh();
      }
    });
  }

  /* -- Reject handler (budget or expense) -- */
  function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setError("A reason is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      let result: { error?: string };
      if (rejectTarget.type === "budget") {
        result = await rejectBudget(rejectTarget.id, rejectReason);
      } else {
        result = await reviewExpense(rejectTarget.id, "rejected", rejectReason);
      }
      if (result.error) {
        setError(result.error);
      } else {
        setRejectTarget(null);
        setRejectReason("");
        router.refresh();
      }
    });
  }

  /* -- Expense approve handler -- */
  function handleApproveExpense() {
    if (!reviewTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await reviewExpense(reviewTarget.id, "approved", null);
      if (result.error) {
        setError(result.error);
      } else {
        setReviewTarget(null);
        router.refresh();
      }
    });
  }

  /* -- Submit draft handler -- */
  function handleSubmitDraft(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await submitExpense(id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  /* -- Reimburse handler -- */
  function handleReimburse(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await markReimbursed(id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Tabs defaultValue="budgets">
        <TabsList>
          <TabsTrigger value="budgets">Budgets ({budgets.length})</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
        </TabsList>

        {/* ==================== BUDGETS TAB ==================== */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={budgetEventFilter} onValueChange={setBudgetEventFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All events</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {canCreateBudget && (
              <Button asChild>
                <Link href="/finance/budgets/new">
                  <Plus className="h-4 w-4" />
                  Add Budget
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-brand-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Proposed</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Approved</TableHead>
                  <TableHead className="hidden text-right lg:table-cell">Spending Limit</TableHead>
                  <TableHead>Status</TableHead>
                  {canApproveBudget && <TableHead className="w-[60px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canApproveBudget ? 7 : 6} className="py-8 text-center text-brand-muted">
                      No budgets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBudgets.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium text-brand-text">
                        {b.event_title}
                      </TableCell>
                      <TableCell className="text-brand-muted">{b.category}</TableCell>
                      <TableCell className="text-right font-mono text-brand-text">
                        {formatINR(b.proposed_amount)}
                      </TableCell>
                      <TableCell className="hidden text-right font-mono text-brand-text md:table-cell">
                        {b.approved_amount != null ? formatINR(b.approved_amount) : "—"}
                      </TableCell>
                      <TableCell className="hidden text-right font-mono text-brand-text lg:table-cell">
                        {b.spending_limit != null ? formatINR(b.spending_limit) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={budgetStatusVariant(b.approval_status)}>
                          {b.approval_status}
                        </Badge>
                      </TableCell>
                      {canApproveBudget && (
                        <TableCell>
                          {b.approval_status === "pending" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setApproveTarget(b);
                                    setApprovedAmount(String(b.proposed_amount));
                                    setSpendingLimit(String(b.proposed_amount));
                                    setError(null);
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setRejectTarget({ id: b.id, type: "budget" });
                                    setRejectReason("");
                                    setError(null);
                                  }}
                                  className="text-red-400"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ==================== EXPENSES TAB ==================== */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                <Input
                  placeholder="Search expenses..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 sm:w-[200px]"
                />
              </div>
              <Select value={expenseStatusFilter} onValueChange={setExpenseStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="reimbursed">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={expenseEventFilter} onValueChange={setExpenseEventFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All events</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canSubmitExpense && (
              <Button asChild>
                <Link href="/finance/expenses/new">
                  <Plus className="h-4 w-4" />
                  New Expense
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-brand-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted By</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-brand-muted">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium text-brand-text">{e.description}</div>
                        {e.vendor && (
                          <span className="text-xs text-brand-muted">{e.vendor}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-brand-text">
                        {formatINR(e.amount)}
                      </TableCell>
                      <TableCell className="hidden text-brand-muted md:table-cell">
                        {e.category}
                      </TableCell>
                      <TableCell className="hidden text-brand-muted lg:table-cell">
                        {e.event_title ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={expenseStatusVariant(e.status)}>
                          {e.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-brand-muted md:table-cell">
                        {new Date(e.expense_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="hidden text-brand-muted lg:table-cell">
                        {e.submitter_name}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {/* Draft: submitter can submit */}
                            {e.status === "draft" && e.submitted_by === session.userId && (
                              <DropdownMenuItem onClick={() => handleSubmitDraft(e.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Submit
                              </DropdownMenuItem>
                            )}
                            {/* Submitted / under_review: approver can approve or reject */}
                            {(e.status === "submitted" || e.status === "under_review") &&
                              canApproveExpense &&
                              e.submitted_by !== session.userId && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setReviewTarget(e);
                                      setError(null);
                                    }}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRejectTarget({ id: e.id, type: "expense" });
                                      setRejectReason("");
                                      setError(null);
                                    }}
                                    className="text-red-400"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            {/* Approved: can mark reimbursed */}
                            {e.status === "approved" && canApproveExpense && (
                              <DropdownMenuItem onClick={() => handleReimburse(e.id)}>
                                <Banknote className="mr-2 h-4 w-4" />
                                Mark Reimbursed
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ==================== APPROVE BUDGET DIALOG ==================== */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => { if (!open) setApproveTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Budget</DialogTitle>
            <DialogDescription>
              Approve the budget for {approveTarget?.category} ({approveTarget?.event_title}).
              Proposed: {approveTarget ? formatINR(approveTarget.proposed_amount) : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="approved_amount">Approved Amount</Label>
              <Input
                id="approved_amount"
                type="number"
                step="0.01"
                min="0"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spending_limit">Spending Limit (optional)</Label>
              <Input
                id="spending_limit"
                type="number"
                step="0.01"
                min="0"
                value={spendingLimit}
                onChange={(e) => setSpendingLimit(e.target.value)}
                placeholder="Same as approved amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleApproveBudget} disabled={isPending}>
              {isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== REJECT DIALOG (budget or expense) ==================== */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject {rejectTarget?.type === "budget" ? "Budget" : "Expense"}
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this {rejectTarget?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reject_reason">Reason</Label>
              <Textarea
                id="reject_reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== APPROVE EXPENSE DIALOG ==================== */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(open) => { if (!open) setReviewTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Expense</DialogTitle>
            <DialogDescription>
              Approve the expense &quot;{reviewTarget?.description}&quot; for{" "}
              {reviewTarget ? formatINR(reviewTarget.amount) : ""}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleApproveExpense} disabled={isPending}>
              {isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
