import { createServerSupabaseClient } from "./server";
import type { Database } from "@hustlers-hive/shared";

type Event = Database["public"]["Tables"]["events"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];

export interface SiteSettings {
  seo_title?: string;
  seo_description?: string;
  community_intro?: string;
  announcement?: string;
  whatsapp_invite_url?: string;
  social_links?: {
    github?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
  };
}

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("site_settings")
      .select("content")
      .eq("id", 1)
      .single();
    return (data?.content as SiteSettings) ?? {};
  }, {});
}

export async function getPublishedEvents(limit?: number): Promise<Event[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("events")
      .select("*")
      .in("status", ["published", "completed"])
      .order("starts_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return data ?? [];
  }, []);
}

export async function getFeaturedEvents(limit = 3): Promise<Event[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .in("status", ["published", "completed"])
      .eq("featured", true)
      .order("starts_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }, []);
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .in("status", ["published", "completed"])
      .single();
    return data;
  }, null);
}

export async function getUpcomingEvents(limit = 3): Promise<Event[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(limit);
    return data ?? [];
  }, []);
}

export async function getPublishedProjects(limit?: number): Promise<Project[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return data ?? [];
  }, []);
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }, []);
}

export async function getPublishedGalleryImages(limit?: number): Promise<GalleryImage[]> {
  return safeQuery(async () => {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("gallery_images")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    if (limit) query = query.limit(limit);
    const { data } = await query;
    return data ?? [];
  }, []);
}
