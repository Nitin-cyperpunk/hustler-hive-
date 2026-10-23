"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProject(formData: FormData) {
  const session = await requirePermission("projects.create");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(title);
  const summary = (formData.get("summary") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const repositoryUrl = (formData.get("repository_url") as string)?.trim() || null;
  const liveUrl = (formData.get("live_url") as string)?.trim() || null;
  const coverImagePath = (formData.get("cover_image_path") as string) || null;
  const techString = (formData.get("technologies") as string)?.trim() ?? "";
  const technologies = techString ? techString.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const status = ((formData.get("status") as string) || "draft") as "draft" | "published";
  const featured = formData.get("featured") === "on";

  if (!title) return { error: "Title is required." };

  const { error } = await supabase.from("projects").insert({
    title,
    slug,
    summary,
    description,
    repository_url: repositoryUrl,
    live_url: liveUrl,
    cover_image_path: coverImagePath,
    technologies,
    status,
    featured,
    created_by: session.userId,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    if (error.code === "23505") return { error: "A project with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  await requirePermission("projects.update");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const repositoryUrl = (formData.get("repository_url") as string)?.trim() || null;
  const liveUrl = (formData.get("live_url") as string)?.trim() || null;
  const coverImagePath = (formData.get("cover_image_path") as string) || null;
  const techString = (formData.get("technologies") as string)?.trim() ?? "";
  const technologies = techString ? techString.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const status = ((formData.get("status") as string) || "draft") as "draft" | "published";
  const featured = formData.get("featured") === "on";

  if (!title) return { error: "Title is required." };

  const { data: existing } = await supabase
    .from("projects")
    .select("published_at")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("projects")
    .update({
      title,
      slug,
      summary,
      description,
      repository_url: repositoryUrl,
      live_url: liveUrl,
      cover_image_path: coverImagePath,
      technologies,
      status,
      featured,
      published_at:
        status === "published" && !existing?.published_at
          ? new Date().toISOString()
          : existing?.published_at ?? null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "A project with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath("/projects");
  redirect("/projects");
}
