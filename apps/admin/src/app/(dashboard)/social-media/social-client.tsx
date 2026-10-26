"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  CheckCircle,
  Send,
  Trash2,
  Globe,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  submitForReview,
  approvePost,
  markPublished,
  deletePost,
} from "./actions";

interface SocialPost {
  id: string;
  title: string;
  caption: string;
  platform: string[];
  campaign: string;
  eventId: string | null;
  eventName: string | null;
  status: string;
  scheduledFor: string | null;
  publishedUrl: string | null;
  publishedAt: string | null;
  createdBy: string;
  creatorName: string;
  reviewedBy: string | null;
  reviewerName: string | null;
  createdAt: string;
}

interface EventOption {
  id: string;
  title: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Twitter/X": "bg-sky-500/15 text-sky-400 border-sky-500/20",
  LinkedIn: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Facebook: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  YouTube: "bg-red-500/15 text-red-400 border-red-500/20",
};

const STATUS_VARIANTS: Record<string, "outline" | "secondary" | "default" | "success"> = {
  draft: "outline",
  in_review: "secondary",
  approved: "default",
  published: "success",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  published: "Published",
};

export function SocialClient({
  session,
  posts,
  events,
}: {
  session: AdminSession;
  posts: SocialPost[];
  events: EventOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [publishTarget, setPublishTarget] = useState<SocialPost | null>(null);
  const [publishUrl, setPublishUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SocialPost | null>(null);

  const canCreate = session.permissions.includes("social.create");
  const canPublish = session.permissions.includes("social.publish");
  const isAdmin = session.role === "super_admin" || session.role === "admin";

  const filteredPosts = posts.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPlatform =
      platformFilter === "all" || p.platform.includes(platformFilter);
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.campaign.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const calendarPosts = [...filteredPosts]
    .filter((p) => p.scheduledFor)
    .sort(
      (a, b) =>
        new Date(a.scheduledFor!).getTime() -
        new Date(b.scheduledFor!).getTime()
    );

  function handleSubmitForReview(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await submitForReview(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleApprove(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await approvePost(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleMarkPublished() {
    if (!publishTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await markPublished(publishTarget.id, publishUrl);
      if (result.error) {
        setError(result.error);
      } else {
        setPublishTarget(null);
        setPublishUrl("");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePost(deleteTarget.id);
      if (result.error) {
        setError(result.error);
      } else {
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  function renderPostsTable(postsToRender: SocialPost[]) {
    return (
      <div className="rounded-lg border border-brand-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Campaign</TableHead>
              <TableHead className="hidden md:table-cell">Scheduled</TableHead>
              <TableHead className="hidden lg:table-cell">Creator</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsToRender.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-brand-muted"
                >
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              postsToRender.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium text-brand-text">
                      {post.title}
                    </div>
                    {post.eventName && (
                      <div className="text-xs text-brand-muted mt-0.5">
                        {post.eventName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.platform.map((p) => (
                        <span
                          key={p}
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${PLATFORM_COLORS[p] ?? "bg-brand-surface text-brand-muted border-brand-border"}`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[post.status] ?? "outline"}>
                      {STATUS_LABELS[post.status] ?? post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-brand-muted">
                    {post.campaign || "---"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-brand-muted">
                    {post.scheduledFor
                      ? new Date(post.scheduledFor).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "---"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-brand-muted">
                    {post.creatorName}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {post.status === "draft" &&
                          post.createdBy === session.userId && (
                            <DropdownMenuItem
                              onClick={() => handleSubmitForReview(post.id)}
                              disabled={isPending}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Submit for Review
                            </DropdownMenuItem>
                          )}
                        {post.status === "in_review" && canPublish && (
                          <DropdownMenuItem
                            onClick={() => handleApprove(post.id)}
                            disabled={isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {post.status === "approved" && canPublish && (
                          <DropdownMenuItem
                            onClick={() => {
                              setPublishTarget(post);
                              setPublishUrl("");
                              setError(null);
                            }}
                          >
                            <Globe className="mr-2 h-4 w-4" />
                            Mark as Published
                          </DropdownMenuItem>
                        )}
                        {post.publishedUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={post.publishedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Published
                            </a>
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteTarget(post);
                                setError(null);
                              }}
                              className="text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">
            Social Media Planner
          </h1>
          <p className="text-sm text-brand-muted">
            Plan, review, and publish social media content
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/social-media/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search by title or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="Twitter/X">Twitter/X</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Posts ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Calendar View ({calendarPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="mx-auto h-8 w-8 text-brand-muted" />
                <p className="mt-3 text-sm text-brand-muted">
                  No social media posts yet.
                </p>
                {canCreate && (
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/social-media/new">
                      <Plus className="h-3.5 w-3.5" />
                      Create your first post
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            renderPostsTable(filteredPosts)
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          {calendarPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-brand-muted" />
                <p className="mt-3 text-sm text-brand-muted">
                  No scheduled posts found.
                </p>
              </CardContent>
            </Card>
          ) : (
            renderPostsTable(calendarPosts)
          )}
        </TabsContent>
      </Tabs>

      {/* Publish dialog */}
      <Dialog
        open={!!publishTarget}
        onOpenChange={(open) => {
          if (!open) setPublishTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Published</DialogTitle>
            <DialogDescription>
              Enter the published URL for &ldquo;{publishTarget?.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="published_url">Published URL</Label>
              <Input
                id="published_url"
                type="url"
                value={publishUrl}
                onChange={(e) => setPublishUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishTarget(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkPublished}
              disabled={isPending || !publishUrl.trim()}
            >
              {isPending ? "Saving..." : "Mark Published"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
