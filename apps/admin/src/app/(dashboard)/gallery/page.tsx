import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Images } from "lucide-react";
import { GalleryManager } from "@/components/gallery-manager";

export default async function GalleryPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: images } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Gallery</h1>
        <p className="text-sm text-gray-500">Manage community photos</p>
      </div>

      {!images || images.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-[#0D1422] p-12 text-center">
          <Images className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-3 text-sm text-gray-500">No gallery images yet.</p>
          <p className="text-xs text-gray-600">Upload images using the form below.</p>
        </div>
      ) : null}

      <GalleryManager
        initialImages={images ?? []}
        events={events ?? []}
      />
    </div>
  );
}
