"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@hustlers-hive/shared/supabase/client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export function ImageUpload({
  folder,
  currentPath,
  onUpload,
}: {
  folder: string;
  currentPath?: string;
  onUpload: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File size must be under 10 MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${folder}/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from("community-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        setPreview(null);
        return;
      }

      onUpload(path);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    onUpload("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const displayPath = currentPath || preview;

  return (
    <div>
      {displayPath ? (
        <div className="relative inline-block">
          <div className="h-32 w-48 overflow-hidden rounded-lg border border-white/10 bg-white/5">
            {preview ? (
              <img
                src={preview}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-600" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-400"
          >
            <X className="h-3 w-3" />
          </button>
          {currentPath && (
            <p className="mt-1 max-w-[12rem] truncate text-xs text-gray-500">
              {currentPath}
            </p>
          )}
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-gray-500 transition-colors hover:border-cyan-400/30 hover:text-gray-400">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
          {uploading ? "Uploading…" : "Click to upload image"}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
