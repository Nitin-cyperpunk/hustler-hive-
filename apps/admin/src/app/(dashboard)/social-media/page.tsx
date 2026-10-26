import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SocialClient } from "./social-client";

export default async function SocialMediaPage() {
  const session = await requirePermission("social.view");
  const supabase = await createServerSupabaseClient();

  const { data: posts } = await supabase
    .from("social_posts")
    .select(
      "id, title, caption, platform, campaign, event_id, asset_paths, status, scheduled_for, published_url, published_at, created_by, reviewed_by, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  // Collect unique user IDs from posts for creator names
  const userIds = [
    ...new Set(
      (posts ?? [])
        .flatMap((p) => [p.created_by, p.reviewed_by])
        .filter(Boolean) as string[]
    ),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", userIds.length > 0 ? userIds : ["__none__"]);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    profileMap[p.user_id] = p.full_name;
  }

  const eventMap: Record<string, string> = {};
  for (const e of events ?? []) {
    eventMap[e.id] = e.title;
  }

  const serializedPosts = (posts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    caption: p.caption ?? "",
    platform: p.platform ?? [],
    campaign: p.campaign ?? "",
    eventId: p.event_id ?? null,
    eventName: p.event_id ? eventMap[p.event_id] ?? null : null,
    status: p.status,
    scheduledFor: p.scheduled_for ?? null,
    publishedUrl: p.published_url ?? null,
    publishedAt: p.published_at ?? null,
    createdBy: p.created_by,
    creatorName: profileMap[p.created_by] ?? "Unknown",
    reviewedBy: p.reviewed_by ?? null,
    reviewerName: p.reviewed_by ? profileMap[p.reviewed_by] ?? null : null,
    createdAt: p.created_at,
  }));

  return (
    <SocialClient
      session={session}
      posts={serializedPosts}
      events={events ?? []}
    />
  );
}
