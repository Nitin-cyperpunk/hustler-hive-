"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function uploadGalleryImage(storagePath: string) {
  const session = await requireAdmin("editor");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("gallery_images").insert({
    storage_path: storagePath,
    created_by: session.userId,
    status: "draft",
  });

  if (error) return { error: error.message };

  revalidatePath("/gallery");
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireAdmin("editor");
  const supabase = await createServerSupabaseClient();

  const altText = (formData.get("alt_text") as string)?.trim() || null;
  const caption = (formData.get("caption") as string)?.trim() || null;
  const status = ((formData.get("status") as string) || "draft") as "draft" | "published";
  const eventId = (formData.get("event_id") as string) || null;

  const { error } = await supabase
    .from("gallery_images")
    .update({ alt_text: altText, caption, status, event_id: eventId })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/gallery");
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin("editor");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/gallery");
}
