import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AssetsClient } from "./assets-client";

export default async function CreativeAssetsPage() {
  const session = await requirePermission("creative.view");
  const supabase = await createServerSupabaseClient();

  const { data: assets } = await supabase
    .from("creative_assets")
    .select(
      "id, title, asset_type, storage_path, event_id, status, reviewed_by, created_by, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  // Collect unique user IDs for creator/reviewer names
  const userIds = [
    ...new Set(
      (assets ?? [])
        .flatMap((a) => [a.created_by, a.reviewed_by])
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

  // Get Supabase URL for building public image URLs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const serializedAssets = (assets ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    assetType: a.asset_type,
    storagePath: a.storage_path,
    imageUrl: `${supabaseUrl}/storage/v1/object/public/community-media/${a.storage_path}`,
    eventId: a.event_id ?? null,
    eventName: a.event_id ? eventMap[a.event_id] ?? null : null,
    status: a.status,
    createdBy: a.created_by,
    creatorName: profileMap[a.created_by] ?? "Unknown",
    reviewedBy: a.reviewed_by ?? null,
    reviewerName: a.reviewed_by ? profileMap[a.reviewed_by] ?? null : null,
    createdAt: a.created_at,
  }));

  return (
    <AssetsClient
      session={session}
      assets={serializedAssets}
      events={events ?? []}
      supabaseUrl={supabaseUrl}
    />
  );
}
