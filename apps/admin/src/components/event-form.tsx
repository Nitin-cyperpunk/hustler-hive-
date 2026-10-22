"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

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
          defaultValue={event?.title}
          onChange={(e) => {
            if (!event?.id) setSlug(slugify(e.target.value));
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
        <textarea
          name="summary"
          rows={2}
          defaultValue={event?.summary ?? ""}
          className="input-field"
        />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={5}
          defaultValue={event?.description ?? ""}
          className="input-field"
        />
      </Field>

      <Field label="Cover Image">
        <ImageUpload
          folder="events"
          currentPath={coverPath}
          onUpload={setCoverPath}
        />
        <input type="hidden" name="cover_image_path" value={coverPath} />
      </Field>

      <Field label="Location">
        <input
          name="location_name"
          defaultValue={event?.location_name ?? ""}
          className="input-field"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date & time" required>
          <input
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event?.starts_at)}
            className="input-field"
          />
        </Field>

        <Field label="End date & time">
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.ends_at)}
            className="input-field"
          />
        </Field>
      </div>

      <Field label="Registration URL">
        <input
          name="registration_url"
          type="url"
          defaultValue={event?.registration_url ?? ""}
          placeholder="https://..."
          className="input-field"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            name="status"
            defaultValue={event?.status ?? "draft"}
            className="input-field"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
          </select>
        </Field>

        <Field label="Featured">
          <label className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={event?.featured}
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-400 focus:ring-cyan-400/20"
            />
            <span className="text-sm text-gray-400">Show as featured event</span>
          </label>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {event?.id ? "Save changes" : "Create event"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
