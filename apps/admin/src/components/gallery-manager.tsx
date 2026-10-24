"use client";

import { useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@hustlers-hive/shared/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from "@/components/ui/alert-dialog";
import {
  uploadGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
} from "@/app/(dashboard)/gallery/actions";

interface GalleryImage {
  id: string;
  storage_path: string;
  alt_text: string | null;
  caption: string | null;
  event_id: string | null;
  category: string;
  status: string;
  sort_order: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function GalleryManager({
  initialImages,
  events,
}: {
  initialImages: GalleryImage[];
  events: { id: string; title: string }[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `gallery/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const result = await uploadGalleryImage(path);
      if (result?.error) setError(result.error);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border bg-brand-surface/30 px-4 py-8 text-sm text-brand-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-text">
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
        {uploading ? "Uploading..." : "Click to upload a gallery image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>

      {error && (
        <div className="rounded-lg border border-brand-error/20 bg-brand-error/5 px-3 py-2.5 text-sm text-brand-error">
          {error}
        </div>
      )}

      {initialImages.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {initialImages.map((img) => (
            <GalleryCard key={img.id} image={img} events={events} />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryCard({
  image,
  events,
}: {
  image: GalleryImage;
  events: { id: string; title: string }[];
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <Badge
            variant={image.status === "published" ? "published" : "draft"}
          >
            {image.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-brand-muted hover:text-brand-error"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Delete image</span>
          </Button>
        </div>

        <p className="truncate text-xs text-brand-muted">
          {image.storage_path}
        </p>

        <form
          className="space-y-2"
          action={async (formData: FormData) => {
            await updateGalleryImage(image.id, formData);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor={`alt-${image.id}`} className="text-xs">
              Alt text
            </Label>
            <Input
              id={`alt-${image.id}`}
              name="alt_text"
              defaultValue={image.alt_text ?? ""}
              placeholder="Describe the image"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`caption-${image.id}`} className="text-xs">
              Caption
            </Label>
            <Input
              id={`caption-${image.id}`}
              name="caption"
              defaultValue={image.caption ?? ""}
              placeholder="Optional caption"
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select name="status" defaultValue={image.status}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Event</Label>
              <Select name="event_id" defaultValue={image.event_id ?? ""}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="No event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No event</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" variant="secondary" size="sm" className="w-full">
            Save
          </Button>
        </form>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the image from the gallery. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-brand-error hover:bg-brand-error/90"
              onClick={async () => {
                setDeleting(true);
                await deleteGalleryImage(image.id);
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
