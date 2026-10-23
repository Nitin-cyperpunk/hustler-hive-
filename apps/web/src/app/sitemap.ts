import type { MetadataRoute } from "next";
import { getPublishedEvents } from "@/lib/supabase/queries";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustler-hive-ten.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getPublishedEvents();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/events/${e.slug}`,
    lastModified: new Date(e.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...eventPages];
}
