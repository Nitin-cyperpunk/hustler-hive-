"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, CheckSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Task = {
  id: string;
  title: string;
  description: string | null;
  department: string | null;
  assigned_to: string | null;
  created_by: string;
  priority: string;
  status: string;
  due_date: string | null;
  event_id: string | null;
  is_claimable: boolean;
  evidence: string | null;
  created_at: string;
  updated_at: string;
};

type SessionInfo = {
  userId: string;
  role: string;
  department: string | null;
  permissions: string[];
};

const PRIORITY_VARIANTS: Record<string, { variant: "destructive" | "warning" | "secondary" | "success"; label: string }> = {
  urgent: { variant: "destructive", label: "Urgent" },
  high: { variant: "warning", label: "High" },
  medium: { variant: "secondary", label: "Medium" },
  low: { variant: "success", label: "Low" },
};

const STATUS_VARIANTS: Record<string, { variant: "outline" | "secondary" | "destructive" | "default" | "success" | "published" | "draft"; label: string }> = {
  todo: { variant: "outline", label: "To Do" },
  in_progress: { variant: "published", label: "In Progress" },
  blocked: { variant: "destructive", label: "Blocked" },
  in_review: { variant: "secondary", label: "In Review" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "draft", label: "Cancelled" },
};

const DEPARTMENT_LABELS: Record<string, string> = {
  operations: "Operations",
  social_media: "Social Media",
  creative: "Creative",
  logistics: "Logistics",
  general: "General",
};

export function TasksClient({
  tasks,
  profileMap,
  eventMap,
  session,
}: {
  tasks: Task[];
  profileMap: Record<string, { name: string }>;
  eventMap: Record<string, string>;
  session: SessionInfo;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const canCreate = session.permissions.includes("tasks.create");

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      if (departmentFilter !== "all" && task.department !== departmentFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, departmentFilter]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">Tasks</h1>
          <p className="text-sm text-brand-muted">
            Manage and track team tasks and assignments
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px] hidden sm:flex">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="mx-auto h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm text-brand-muted">
              {tasks.length === 0 ? "No tasks yet." : "No tasks match your filters."}
            </p>
            {tasks.length === 0 && canCreate && (
              <Button variant="link" asChild className="mt-2">
                <Link href="/tasks/new">
                  <Plus className="h-3.5 w-3.5" />
                  Create your first task
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Assignee</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task) => {
                const priority = PRIORITY_VARIANTS[task.priority] ?? PRIORITY_VARIANTS.medium;
                const status = STATUS_VARIANTS[task.status] ?? STATUS_VARIANTS.todo;
                const assignee = task.assigned_to
                  ? profileMap[task.assigned_to]?.name ?? "Unknown"
                  : task.is_claimable
                    ? "Claimable"
                    : "Unassigned";

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="font-medium text-brand-text hover:text-brand-cyan transition-colors"
                      >
                        {task.title}
                      </Link>
                      {task.event_id && eventMap[task.event_id] && (
                        <div className="mt-0.5 text-xs text-brand-muted truncate max-w-[200px]">
                          {eventMap[task.event_id]}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-brand-muted md:table-cell">
                      {task.is_claimable && !task.assigned_to ? (
                        <span className="text-brand-cyan text-xs font-medium">Open to claim</span>
                      ) : (
                        assignee
                      )}
                    </TableCell>
                    <TableCell className="hidden text-brand-muted lg:table-cell">
                      {task.department ? DEPARTMENT_LABELS[task.department] ?? task.department : "---"}
                    </TableCell>
                    <TableCell className="hidden text-brand-muted md:table-cell">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "---"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tasks/${task.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
