import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Images } from "lucide-react";
import { GalleryManager } from "@/components/gallery-manager";
import { Card, CardContent } from "@/components/ui/card";

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
        <h1 className="text-lg font-bold text-brand-text">Gallery</h1>
        <p className="text-sm text-brand-muted">Manage community photos</p>
      </div>

      {!images || images.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="py-12 text-center">
            <Images className="mx-auto h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm text-brand-muted">No gallery images yet.</p>
            <p className="text-xs text-brand-muted/70">Upload images using the form below.</p>
          </CardContent>
        </Card>
      ) : null}

      <GalleryManager
        initialImages={images ?? []}
        events={events ?? []}
      />
    </div>
  );
}
