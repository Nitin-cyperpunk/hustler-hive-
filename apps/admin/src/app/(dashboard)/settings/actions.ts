"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export async function updateSettings(formData: FormData) {
  const session = await requirePermission("settings.manage");
  const supabase = await createServerSupabaseClient();

  const content = {
    community_intro: (formData.get("community_intro") as string)?.trim() ?? "",
    whatsapp_invite_url: (formData.get("whatsapp_invite_url") as string)?.trim() ?? "",
    social_links: {
      github: (formData.get("social_github") as string)?.trim() ?? "",
      twitter: (formData.get("social_twitter") as string)?.trim() ?? "",
      instagram: (formData.get("social_instagram") as string)?.trim() ?? "",
      linkedin: (formData.get("social_linkedin") as string)?.trim() ?? "",
      youtube: (formData.get("social_youtube") as string)?.trim() ?? "",
    },
    featured_event_id: (formData.get("featured_event_id") as string) || null,
    announcement: (formData.get("announcement") as string)?.trim() ?? "",
    seo_title: (formData.get("seo_title") as string)?.trim() ?? "",
    seo_description: (formData.get("seo_description") as string)?.trim() ?? "",
  };

  const { error } = await supabase
    .from("site_settings")
    .update({ content, updated_by: session.userId })
    .eq("id", 1);

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "settings.update",
    targetType: "site_settings",
  });

  revalidatePath("/settings");
  return { success: true };
}
