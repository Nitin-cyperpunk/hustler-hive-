"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Send,
  Trash2,
  Upload,
  MoreHorizontal,
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
import { Card, CardContent } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  uploadAsset,
  submitForReview,
  reviewAsset,
  deleteAsset,
} from "./actions";

interface Asset {
  id: string;
  title: string;
  assetType: string;
  storagePath: string;
  imageUrl: string;
  eventId: string | null;
  eventName: string | null;
  status: string;
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

const ASSET_TYPE_LABELS: Record<string, string> = {
  poster: "Poster",
  banner: "Banner",
  thumbnail: "Thumbnail",
  certificate_design: "Certificate Design",
  social_graphic: "Social Graphic",
  other: "Other",
};

const STATUS_VARIANTS: Record<string, "outline" | "secondary" | "default" | "success" | "destructive"> = {
  draft: "outline",
  in_review: "secondary",
  approved: "success",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

export function AssetsClient({
  session,
  assets,
  events,
  supabaseUrl,
}: {
  session: AdminSession;
  assets: Asset[];
  events: EventOption[];
  supabaseUrl: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadEventId, setUploadEventId] = useState("");

  const canUpload = session.permissions.includes("creative.upload");
  const canApprove = session.permissions.includes("creative.approve");
  const isAdmin = session.role === "super_admin" || session.role === "admin";

  const filteredAssets = assets.filter((a) => {
    const matchesType = typeFilter === "all" || a.assetType === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesEvent =
      eventFilter === "all" || a.eventId === eventFilter;
    const matchesSearch =
      !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesEvent && matchesSearch;
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleUpload(formData: FormData) {
    setError(null);
    setSuccess(null);

    if (selectedFile) {
      formData.set("file", selectedFile);
    }

    if (uploadEventId && uploadEventId !== "none") {
      formData.set("event_id", uploadEventId);
    } else {
      formData.delete("event_id");
    }

    startTransition(async () => {
      const result = await uploadAsset(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setUploadOpen(false);
        setSelectedFile(null);
        setFilePreview(null);
        setUploadEventId("");
        setSuccess("Asset uploaded successfully.");
        router.refresh();
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  }

  function handleSubmitForReview(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await submitForReview(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleReview(id: string, decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await reviewAsset(id, decision);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAsset(deleteTarget.id);
      if (result.error) {
        setError(result.error);
      } else {
        setDeleteTarget(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">
            Creative Assets
          </h1>
          <p className="text-sm text-brand-muted">
            Upload, review, and manage design assets
          </p>
        </div>
        {canUpload && (
          <Button
            onClick={() => {
              setUploadOpen(true);
              setError(null);
              setSelectedFile(null);
              setFilePreview(null);
              setUploadEventId("");
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          <Input
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Asset type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="poster">Poster</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="thumbnail">Thumbnail</SelectItem>
            <SelectItem value="certificate_design">Certificate</SelectItem>
            <SelectItem value="social_graphic">Social Graphic</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asset Grid */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm text-brand-muted">
              No creative assets yet.
            </p>
            {canUpload && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setUploadOpen(true);
                  setError(null);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Upload your first asset
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-brand-muted">
              No assets match your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              {/* Image Preview */}
              <div className="relative aspect-video bg-brand-surface">
                <img
                  src={asset.imageUrl}
                  alt={asset.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-brand-bg/80 backdrop-blur-sm"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {asset.status === "draft" &&
                        asset.createdBy === session.userId && (
                          <DropdownMenuItem
                            onClick={() => handleSubmitForReview(asset.id)}
                            disabled={isPending}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Submit for Review
                          </DropdownMenuItem>
                        )}
                      {asset.status === "in_review" && canApprove && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleReview(asset.id, "approved")
                            }
                            disabled={isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleReview(asset.id, "rejected")
                            }
                            disabled={isPending}
                            className="text-red-400"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setDeleteTarget(asset);
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
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-brand-text line-clamp-1">
                    {asset.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={STATUS_VARIANTS[asset.status] ?? "outline"}>
                    {STATUS_LABELS[asset.status] ?? asset.status}
                  </Badge>
                  <Badge variant="secondary">
                    {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
                  </Badge>
                </div>

                {asset.eventName && (
                  <p className="text-xs text-brand-muted truncate">
                    {asset.eventName}
                  </p>
                )}

                <p className="text-xs text-brand-muted">
                  by {asset.creatorName} &middot;{" "}
                  {new Date(asset.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          if (!open) {
            setUploadOpen(false);
            setSelectedFile(null);
            setFilePreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Creative Asset</DialogTitle>
            <DialogDescription>
              Upload an image asset for review and approval.
            </DialogDescription>
          </DialogHeader>
          <form action={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Title *</Label>
              <Input
                id="upload-title"
                name="title"
                required
                placeholder="Asset title"
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-type">Asset Type *</Label>
              <Select name="asset_type" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poster">Poster</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="thumbnail">Thumbnail</SelectItem>
                  <SelectItem value="certificate_design">
                    Certificate Design
                  </SelectItem>
                  <SelectItem value="social_graphic">
                    Social Graphic
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Linked Event</Label>
              <Select value={uploadEventId} onValueChange={setUploadEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No event</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File *</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand-border p-6 transition-colors hover:border-brand-cyan/50"
                onClick={() => fileInputRef.current?.click()}
              >
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-40 rounded object-contain"
                  />
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-brand-muted" />
                    <p className="text-sm text-brand-muted">
                      Click to select an image
                    </p>
                    <p className="text-xs text-brand-muted/70">
                      Max 10MB, images only
                    </p>
                  </>
                )}
                {selectedFile && (
                  <p className="mt-2 text-xs text-brand-muted">
                    {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !selectedFile}>
                <Upload className="mr-2 h-4 w-4" />
                {isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
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
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo;
              and its file from storage. This action cannot be undone.
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
