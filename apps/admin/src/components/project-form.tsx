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

interface ProjectData {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  description?: string | null;
  repository_url?: string | null;
  live_url?: string | null;
  cover_image_path?: string | null;
  technologies?: string[];
  status?: string;
  featured?: boolean;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ProjectForm({
  project,
  action,
}: {
  project?: ProjectData;
  action: (formData: FormData) => Promise<{ error: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [coverPath, setCoverPath] = useState(project?.cover_image_path ?? "");
  const [status, setStatus] = useState(project?.status ?? "draft");
  const [featured, setFeatured] = useState(project?.featured ?? false);

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
              defaultValue={project?.title}
              onChange={(e) => {
                if (!project?.id) setSlug(slugify(e.target.value));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" name="summary" rows={2} defaultValue={project?.summary ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={5} defaultValue={project?.description ?? ""} />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <ImageUpload folder="projects" currentPath={coverPath} onUpload={setCoverPath} />
            <input type="hidden" name="cover_image_path" value={coverPath} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository_url">Repository URL</Label>
            <Input id="repository_url" name="repository_url" type="url" defaultValue={project?.repository_url ?? ""} placeholder="https://github.com/..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_url">Live URL</Label>
            <Input id="live_url" name="live_url" type="url" defaultValue={project?.live_url ?? ""} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input id="technologies" name="technologies" defaultValue={(project?.technologies ?? []).join(", ")} placeholder="Next.js, TypeScript, Supabase" />
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
              {project?.id ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
