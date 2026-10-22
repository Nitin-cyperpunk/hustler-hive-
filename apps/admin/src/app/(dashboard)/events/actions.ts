"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createEvent(formData: FormData) {
  const session = await requireAdmin("editor");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(title);
  const summary = (formData.get("summary") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const locationName = (formData.get("location_name") as string)?.trim() || null;
  const startsAt = formData.get("starts_at") as string;
  const endsAt = (formData.get("ends_at") as string) || null;
  const registrationUrl = (formData.get("registration_url") as string)?.trim() || null;
  const status = ((formData.get("status") as string) || "draft") as "draft" | "published" | "completed";
  const featured = formData.get("featured") === "on";
  const coverImagePath = (formData.get("cover_image_path") as string) || null;

  if (!title) return { error: "Title is required." };
  if (!startsAt) return { error: "Start date is required." };

  const { error } = await supabase.from("events").insert({
    title,
    slug,
    summary,
    description,
    location_name: locationName,
    starts_at: startsAt,
    ends_at: endsAt || null,
    registration_url: registrationUrl,
    status,
    featured,
    cover_image_path: coverImagePath,
    created_by: session.userId,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    if (error.code === "23505") return { error: "An event with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath("/events");
  redirect("/events");
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin("editor");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const locationName = (formData.get("location_name") as string)?.trim() || null;
  const startsAt = formData.get("starts_at") as string;
  const endsAt = (formData.get("ends_at") as string) || null;
  const registrationUrl = (formData.get("registration_url") as string)?.trim() || null;
  const status = ((formData.get("status") as string) || "draft") as "draft" | "published" | "completed";
  const featured = formData.get("featured") === "on";
  const coverImagePath = (formData.get("cover_image_path") as string) || null;

  if (!title) return { error: "Title is required." };
  if (!startsAt) return { error: "Start date is required." };

  // Get existing event to check published_at
  const { data: existing } = await supabase
    .from("events")
    .select("published_at")
    .eq("id", id)
    .single();

  const publishedAt =
    status === "published" && !existing?.published_at
      ? new Date().toISOString()
      : existing?.published_at ?? null;

  const { error } = await supabase
    .from("events")
    .update({
      title,
      slug,
      summary,
      description,
      location_name: locationName,
      starts_at: startsAt,
      ends_at: endsAt || null,
      registration_url: registrationUrl,
      status,
      featured,
      cover_image_path: coverImagePath,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "An event with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath("/events");
  redirect("/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin("admin");
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  redirect("/events");
}
