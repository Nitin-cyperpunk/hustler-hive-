"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

const VALID_ASSET_TYPES = [
  "poster",
  "banner",
  "thumbnail",
  "certificate_design",
  "social_graphic",
  "other",
];

export async function uploadAsset(formData: FormData) {
  const session = await requirePermission("creative.upload");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const assetType = formData.get("asset_type") as string;
  const eventId = (formData.get("event_id") as string)?.trim() || null;
  const file = formData.get("file") as File | null;

  if (!title || title.length < 1 || title.length > 300) {
    return { error: "Title is required and must be at most 300 characters." };
  }

  if (!assetType || !VALID_ASSET_TYPES.includes(assetType)) {
    return { error: "A valid asset type must be selected." };
  }

  if (!file || file.size === 0) {
    return { error: "A file must be uploaded." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "File size must be under 10MB." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image files are allowed." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const timestamp = Date.now();
  const storagePath = `creative-assets/${session.userId}/${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("community-media")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: asset, error: insertError } = await supabase
    .from("creative_assets")
    .insert({
      title,
      asset_type: assetType as "poster" | "banner" | "thumbnail" | "certificate_design" | "social_graphic" | "other",
      storage_path: storagePath,
      event_id: eventId || null,
      status: "draft",
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  await writeAuditLog(session.userId, {
    action: "creative_asset.uploaded",
    targetType: "creative_asset",
    targetId: asset.id,
    metadata: { title, asset_type: assetType, storage_path: storagePath },
  });

  revalidatePath("/creative-assets");
  return { success: true };
}

export async function updateAsset(id: string, formData: FormData) {
  const session = await requirePermission("creative.upload");
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("creative_assets")
    .select("id, created_by, status")
    .eq("id", id)
    .single();

  if (!existing) {
    return { error: "Asset not found." };
  }

  if (existing.created_by !== session.userId || existing.status !== "draft") {
    return { error: "You can only edit your own draft assets." };
  }

  const title = (formData.get("title") as string)?.trim();
  const assetType = formData.get("asset_type") as string;
  const eventId = (formData.get("event_id") as string)?.trim() || null;

  if (!title || title.length < 1 || title.length > 300) {
    return { error: "Title is required and must be at most 300 characters." };
  }

  if (!assetType || !VALID_ASSET_TYPES.includes(assetType)) {
    return { error: "A valid asset type must be selected." };
  }

  const { error } = await supabase
    .from("creative_assets")
    .update({
      title,
      asset_type: assetType as "poster" | "banner" | "thumbnail" | "certificate_design" | "social_graphic" | "other",
      event_id: eventId || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "creative_asset.updated",
    targetType: "creative_asset",
    targetId: id,
    metadata: { title },
  });

  revalidatePath("/creative-assets");
  return { success: true };
}

export async function submitForReview(id: string) {
  const session = await requirePermission("creative.upload");
  const supabase = await createServerSupabaseClient();

  const { data: asset } = await supabase
    .from("creative_assets")
    .select("id, created_by, status")
    .eq("id", id)
    .single();

  if (!asset) {
    return { error: "Asset not found." };
  }

  if (asset.created_by !== session.userId) {
    return { error: "Only the creator can submit an asset for review." };
  }

  if (asset.status !== "draft") {
    return { error: "Only draft assets can be submitted for review." };
  }

  const { error } = await supabase
    .from("creative_assets")
    .update({ status: "in_review" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "creative_asset.submitted_for_review",
    targetType: "creative_asset",
    targetId: id,
  });

  revalidatePath("/creative-assets");
  return { success: true };
}

export async function reviewAsset(
  id: string,
  decision: "approved" | "rejected"
) {
  const session = await requirePermission("creative.approve");
  const supabase = await createServerSupabaseClient();

  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Decision must be 'approved' or 'rejected'." };
  }

  const { data: asset } = await supabase
    .from("creative_assets")
    .select("id, status, title")
    .eq("id", id)
    .single();

  if (!asset) {
    return { error: "Asset not found." };
  }

  if (asset.status !== "in_review") {
    return { error: "Only assets in review can be reviewed." };
  }

  const { error } = await supabase
    .from("creative_assets")
    .update({
      status: decision,
      reviewed_by: session.userId,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: `creative_asset.${decision}`,
    targetType: "creative_asset",
    targetId: id,
    metadata: { title: asset.title, decision },
  });

  revalidatePath("/creative-assets");
  return { success: true };
}

export async function deleteAsset(id: string) {
  const session = await requireAdmin("admin");
  const supabase = await createServerSupabaseClient();

  const { data: asset } = await supabase
    .from("creative_assets")
    .select("id, title, storage_path")
    .eq("id", id)
    .single();

  if (!asset) {
    return { error: "Asset not found." };
  }

  // Delete the file from storage
  if (asset.storage_path) {
    await supabase.storage
      .from("community-media")
      .remove([asset.storage_path]);
  }

  const { error } = await supabase
    .from("creative_assets")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "creative_asset.deleted",
    targetType: "creative_asset",
    targetId: id,
    metadata: { title: asset.title },
  });

  revalidatePath("/creative-assets");
  return { success: true };
}
