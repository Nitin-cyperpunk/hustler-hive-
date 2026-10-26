"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

const VALID_PLATFORMS = ["Instagram", "Twitter/X", "LinkedIn", "Facebook", "YouTube"];
const VALID_STATUSES = ["draft", "in_review", "approved", "published"];

export async function createPost(formData: FormData) {
  const session = await requirePermission("social.create");
  const supabase = await createServerSupabaseClient();

  const title = (formData.get("title") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim() || null;
  const platformRaw = formData.getAll("platform") as string[];
  const campaign = (formData.get("campaign") as string)?.trim() || null;
  const eventId = (formData.get("event_id") as string)?.trim() || null;
  const scheduledFor = (formData.get("scheduled_for") as string)?.trim() || null;

  if (!title || title.length < 1 || title.length > 300) {
    return { error: "Title is required and must be at most 300 characters." };
  }

  const platform = platformRaw.filter((p) => VALID_PLATFORMS.includes(p));
  if (platform.length === 0) {
    return { error: "At least one platform must be selected." };
  }

  const { data: post, error } = await supabase
    .from("social_posts")
    .insert({
      title,
      caption,
      platform,
      campaign,
      event_id: eventId || null,
      scheduled_for: scheduledFor || null,
      created_by: session.userId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.created",
    targetType: "social_post",
    targetId: post.id,
    metadata: { title, platform },
  });

  revalidatePath("/social-media");
  return { success: true };
}

export async function updatePost(id: string, formData: FormData) {
  const session = await requirePermission("social.create");
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("social_posts")
    .select("id, created_by, status")
    .eq("id", id)
    .single();

  if (!existing) {
    return { error: "Post not found." };
  }

  const canPublish = session.permissions.includes("social.publish");
  const isCreator = existing.created_by === session.userId;

  if (!canPublish && !(isCreator && existing.status === "draft")) {
    return { error: "You can only edit your own draft posts." };
  }

  const title = (formData.get("title") as string)?.trim();
  const caption = (formData.get("caption") as string)?.trim() || null;
  const platformRaw = formData.getAll("platform") as string[];
  const campaign = (formData.get("campaign") as string)?.trim() || null;
  const eventId = (formData.get("event_id") as string)?.trim() || null;
  const scheduledFor = (formData.get("scheduled_for") as string)?.trim() || null;

  if (!title || title.length < 1 || title.length > 300) {
    return { error: "Title is required and must be at most 300 characters." };
  }

  const platform = platformRaw.filter((p) => VALID_PLATFORMS.includes(p));

  const { error } = await supabase
    .from("social_posts")
    .update({
      title,
      caption,
      platform,
      campaign,
      event_id: eventId || null,
      scheduled_for: scheduledFor || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.updated",
    targetType: "social_post",
    targetId: id,
    metadata: { title },
  });

  revalidatePath("/social-media");
  return { success: true };
}

export async function submitForReview(id: string) {
  const session = await requirePermission("social.create");
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("social_posts")
    .select("id, created_by, status")
    .eq("id", id)
    .single();

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.created_by !== session.userId) {
    return { error: "Only the creator can submit a post for review." };
  }

  if (post.status !== "draft") {
    return { error: "Only draft posts can be submitted for review." };
  }

  const { error } = await supabase
    .from("social_posts")
    .update({ status: "in_review" })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.submitted_for_review",
    targetType: "social_post",
    targetId: id,
  });

  revalidatePath("/social-media");
  return { success: true };
}

export async function approvePost(id: string) {
  const session = await requirePermission("social.publish");
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("social_posts")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.status !== "in_review") {
    return { error: "Only posts in review can be approved." };
  }

  const { error } = await supabase
    .from("social_posts")
    .update({ status: "approved", reviewed_by: session.userId })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.approved",
    targetType: "social_post",
    targetId: id,
  });

  revalidatePath("/social-media");
  return { success: true };
}

export async function markPublished(id: string, publishedUrl: string) {
  const session = await requirePermission("social.publish");
  const supabase = await createServerSupabaseClient();

  if (!publishedUrl || !publishedUrl.trim()) {
    return { error: "Published URL is required." };
  }

  const { data: post } = await supabase
    .from("social_posts")
    .select("id, status")
    .eq("id", id)
    .single();

  if (!post) {
    return { error: "Post not found." };
  }

  if (post.status !== "approved") {
    return { error: "Only approved posts can be marked as published." };
  }

  const { error } = await supabase
    .from("social_posts")
    .update({
      status: "published",
      published_url: publishedUrl.trim(),
      published_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.published",
    targetType: "social_post",
    targetId: id,
    metadata: { published_url: publishedUrl.trim() },
  });

  revalidatePath("/social-media");
  return { success: true };
}

export async function deletePost(id: string) {
  const session = await requireAdmin("admin");
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("social_posts")
    .select("id, title")
    .eq("id", id)
    .single();

  if (!post) {
    return { error: "Post not found." };
  }

  const { error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog(session.userId, {
    action: "social_post.deleted",
    targetType: "social_post",
    targetId: id,
    metadata: { title: post.title },
  });

  revalidatePath("/social-media");
  return { success: true };
}
