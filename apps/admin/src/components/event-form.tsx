"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface EventData {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  description?: string | null;
  cover_image_path?: string | null;
  location_name?: string | null;
  starts_at?: string;
  ends_at?: string | null;
  registration_url?: string | null;
  status?: string;
  featured?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDatetimeLocal(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  event,
  action,
}: {
  event?: EventData;
  action: (formData: FormData) => Promise<{ error: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [coverPath, setCoverPath] = useState(event?.cover_image_path ?? "");
  const [status, setStatus] = useState(event?.status ?? "draft");
  const [featured, setFeatured] = useState(event?.featured ?? false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (coverPath) formData.set("cover_image_path", coverPath);
    formData.set("status", status);
    if (featured) formData.set("featured", "on");

    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-brand-error/20 bg-brand-error/5 px-3 py-2.5 text-sm text-brand-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-brand-error">*</span></Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={event?.title}
              onChange={(e) => {
                if (!event?.id) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" rows={2} defaultValue={event?.summary ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={5} defaultValue={event?.description ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload folder="events" currentPath={coverPath} onUpload={setCoverPath} />
            <input type="hidden" name="cover_image_path" value={coverPath} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Location</Label>
            <Input id="location_name" name="location_name" defaultValue={event?.location_name ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start date & time <span className="text-brand-error">*</span></Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={toDatetimeLocal(event?.starts_at)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">End date & time</Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={toDatetimeLocal(event?.ends_at)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registration_url">Registration URL</Label>
            <Input id="registration_url" name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} placeholder="https://..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Featured</Label>
              <div className="flex items-center gap-2 pt-1">
                <Switch checked={featured} onCheckedChange={setFeatured} />
                <span className="text-sm text-brand-muted">Show as featured</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {event?.id ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
