"use client";

import { useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@hustlers-hive/shared/supabase/client";
import { StatusBadge } from "@/components/status-badge";
import { uploadGalleryImage, deleteGalleryImage, updateGalleryImage } from "@/app/(dashboard)/gallery/actions";

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
    <div className="mt-6 space-y-4">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-gray-500 transition-colors hover:border-cyan-400/30">
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        {uploading ? "Uploading…" : "Click to upload a gallery image"}
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {error && <p className="text-xs text-red-400">{error}</p>}

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

  return (
    <div className="rounded-xl border border-white/5 bg-[#0D1422] p-3">
      <div className="mb-2 flex items-center justify-between">
        <StatusBadge status={image.status} />
        <form
          action={async () => {
            setDeleting(true);
            await deleteGalleryImage(image.id);
          }}
        >
          <button
            type="submit"
            disabled={deleting}
            className="rounded p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </form>
      </div>

      <p className="truncate text-xs text-gray-500">{image.storage_path}</p>

      <form
        className="mt-2 space-y-2"
        action={async (formData: FormData) => {
          await updateGalleryImage(image.id, formData);
        }}
      >
        <input
          name="alt_text"
          defaultValue={image.alt_text ?? ""}
          placeholder="Alt text"
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-gray-600"
        />
        <input
          name="caption"
          defaultValue={image.caption ?? ""}
          placeholder="Caption"
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white placeholder-gray-600"
        />
        <select
          name="status"
          defaultValue={image.status}
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select
          name="event_id"
          defaultValue={image.event_id ?? ""}
          className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
        >
          <option value="">No event</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-white/5 px-2 py-1 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}
