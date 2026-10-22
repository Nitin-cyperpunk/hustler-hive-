"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (coverPath) formData.set("cover_image_path", coverPath);

    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Field label="Title" required>
        <input
          name="title"
          required
          defaultValue={project?.title}
          onChange={(e) => {
            if (!project?.id) setSlug(slugify(e.target.value));
          }}
          className="input-field"
        />
      </Field>

      <Field label="Slug">
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input-field font-mono text-xs"
        />
      </Field>

      <Field label="Summary">
        <textarea name="summary" rows={2} defaultValue={project?.summary ?? ""} className="input-field" />
      </Field>

      <Field label="Description">
        <textarea name="description" rows={5} defaultValue={project?.description ?? ""} className="input-field" />
      </Field>

      <Field label="Cover Image">
        <ImageUpload folder="projects" currentPath={coverPath} onUpload={setCoverPath} />
        <input type="hidden" name="cover_image_path" value={coverPath} />
      </Field>

      <Field label="Repository URL">
        <input name="repository_url" type="url" defaultValue={project?.repository_url ?? ""} placeholder="https://github.com/..." className="input-field" />
      </Field>

      <Field label="Live URL">
        <input name="live_url" type="url" defaultValue={project?.live_url ?? ""} placeholder="https://..." className="input-field" />
      </Field>

      <Field label="Technologies (comma-separated)">
        <input
          name="technologies"
          defaultValue={(project?.technologies ?? []).join(", ")}
          placeholder="Next.js, TypeScript, Supabase"
          className="input-field"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select name="status" defaultValue={project?.status ?? "draft"} className="input-field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>

        <Field label="Featured">
          <label className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={project?.featured}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-sm text-gray-400">Show as featured</span>
          </label>
        </Field>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {project?.id ? "Save changes" : "Create project"}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
