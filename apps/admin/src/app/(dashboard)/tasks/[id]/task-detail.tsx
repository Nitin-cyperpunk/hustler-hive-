"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flag,
  User,
  Building2,
  LinkIcon,
  Send,
  Trash2,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateTask, deleteTask, addTaskComment, claimTask } from "../actions";

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

type Comment = {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

type Member = {
  user_id: string;
  name: string;
  role: string;
  department: string | null;
};

const PRIORITY_VARIANTS: Record<string, { variant: "destructive" | "warning" | "secondary" | "success"; label: string }> = {
  urgent: { variant: "destructive", label: "Urgent" },
  high: { variant: "warning", label: "High" },
  medium: { variant: "secondary", label: "Medium" },
  low: { variant: "success", label: "Low" },
};

const STATUS_VARIANTS: Record<string, { variant: "outline" | "secondary" | "destructive" | "default" | "success" | "published"; label: string }> = {
  todo: { variant: "outline", label: "To Do" },
  in_progress: { variant: "published", label: "In Progress" },
  blocked: { variant: "destructive", label: "Blocked" },
  in_review: { variant: "secondary", label: "In Review" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "outline", label: "Cancelled" },
};

const DEPARTMENT_LABELS: Record<string, string> = {
  operations: "Operations",
  social_media: "Social Media",
  creative: "Creative",
  logistics: "Logistics",
  general: "General",
};

export function TaskDetail({
  task,
  comments,
  profileMap,
  eventMap,
  members,
  session,
  isAdmin,
  isAssignee,
  canAssign,
  canDelete,
}: {
  task: Task;
  comments: Comment[];
  profileMap: Record<string, { name: string }>;
  eventMap: Record<string, string>;
  members: Member[];
  session: { userId: string; role: string; permissions: string[] };
  isAdmin: boolean;
  isAssignee: boolean;
  canAssign: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canEdit = isAdmin || isAssignee;
  const canClaim = task.is_claimable && !task.assigned_to && !isAdmin;

  const priority = PRIORITY_VARIANTS[task.priority] ?? PRIORITY_VARIANTS.medium;
  const status = STATUS_VARIANTS[task.status] ?? STATUS_VARIANTS.todo;
  const assigneeName = task.assigned_to
    ? profileMap[task.assigned_to]?.name ?? "Unknown"
    : task.is_claimable
      ? "Open to claim"
      : "Unassigned";
  const creatorName = profileMap[task.created_by]?.name ?? "Unknown";

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("status", newStatus);
      if (task.evidence) formData.set("evidence", task.evidence);
      const result = await updateTask(task.id, formData);
      if (result && "error" in result && result.error) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  function handleEvidenceSubmit(formData: FormData) {
    startTransition(async () => {
      setError(null);
      formData.set("status", task.status);
      const result = await updateTask(task.id, formData);
      if (result && "error" in result && result.error) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  function handleReassign(userId: string) {
    startTransition(async () => {
      setError(null);
      const formData = new FormData();
      formData.set("title", task.title);
      formData.set("description", task.description ?? "");
      formData.set("department", task.department ?? "");
      formData.set("assigned_to", userId);
      formData.set("priority", task.priority);
      formData.set("status", task.status);
      formData.set("due_date", task.due_date ?? "");
      formData.set("event_id", task.event_id ?? "");
      if (task.is_claimable) formData.set("is_claimable", "on");
      if (task.evidence) formData.set("evidence", task.evidence);
      const result = await updateTask(task.id, formData);
      if (result && "error" in result && result.error) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  function handleClaim() {
    startTransition(async () => {
      setError(null);
      const result = await claimTask(task.id);
      if (result && "error" in result && result.error) {
        setError(result.error ?? null);
      } else {
        router.refresh();
      }
    });
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    startTransition(async () => {
      setError(null);
      const result = await addTaskComment(task.id, commentText);
      if (result && "error" in result && result.error) {
        setError(result.error ?? null);
      } else {
        setCommentText("");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-brand-text">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={priority.variant}>{priority.label}</Badge>
              <Badge variant={status.variant}>{status.label}</Badge>
              {task.is_claimable && !task.assigned_to && (
                <Badge variant="published">Claimable</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canClaim && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClaim}
                disabled={isPending}
              >
                <Hand className="h-4 w-4" />
                Claim Task
              </Button>
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-brand-error text-white hover:bg-brand-error/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-brand-error/30 bg-brand-error/10 px-4 py-3 text-sm text-brand-error">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-brand-text">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-sm text-brand-muted whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-sm text-brand-muted italic">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Status Update - only for assignee or admin */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-brand-text">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["todo", "in_progress", "blocked", "in_review", "completed", "cancelled"].map(
                    (s) => {
                      const sv = STATUS_VARIANTS[s];
                      return (
                        <Button
                          key={s}
                          variant={task.status === s ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(s)}
                          disabled={isPending || task.status === s}
                        >
                          {sv?.label ?? s}
                        </Button>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-brand-text">Evidence / Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={handleEvidenceSubmit} className="space-y-3">
                  <Textarea
                    name="evidence"
                    rows={3}
                    defaultValue={task.evidence ?? ""}
                    placeholder="Add evidence, links, or notes about task completion..."
                  />
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Evidence"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Evidence display for non-editors */}
          {!canEdit && task.evidence && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-brand-text">Evidence / Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brand-muted whitespace-pre-wrap">{task.evidence}</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-brand-text">
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 && (
                <p className="text-sm text-brand-muted italic">No comments yet.</p>
              )}

              {comments.map((comment) => {
                const author = profileMap[comment.author_id]?.name ?? "Unknown";
                return (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/10 text-[10px] font-bold text-brand-cyan">
                        {author[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-brand-text">{author}</span>
                      <span className="text-xs text-brand-muted">
                        {new Date(comment.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="ml-8 text-sm text-brand-muted whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    {comment !== comments[comments.length - 1] && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                );
              })}

              {/* Add comment form */}
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs text-brand-muted">Add a comment</Label>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  placeholder="Write a comment..."
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={isPending || !commentText.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                  {isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-brand-text">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Assignee:</span>
                <span className="text-brand-text">
                  {task.assigned_to
                    ? assigneeName
                    : task.is_claimable
                      ? <span className="text-brand-cyan">Open to claim</span>
                      : "Unassigned"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Created by:</span>
                <span className="text-brand-text">{creatorName}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Department:</span>
                <span className="text-brand-text">
                  {task.department ? DEPARTMENT_LABELS[task.department] ?? task.department : "---"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Flag className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Priority:</span>
                <Badge variant={priority.variant}>{priority.label}</Badge>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Due date:</span>
                <span className="text-brand-text">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "---"}
                </span>
              </div>

              {task.event_id && eventMap[task.event_id] && (
                <div className="flex items-center gap-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-brand-muted" />
                  <span className="text-brand-muted">Event:</span>
                  <span className="text-brand-text">{eventMap[task.event_id]}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-brand-muted" />
                <span className="text-brand-muted">Created:</span>
                <span className="text-brand-text">
                  {new Date(task.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Reassign */}
          {canAssign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-brand-text">Reassign Task</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={task.assigned_to ?? ""}
                  onValueChange={handleReassign}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
