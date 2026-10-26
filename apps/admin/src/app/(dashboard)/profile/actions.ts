"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const URL_RE = /^https?:\/\/.+/;

function validateUrl(value: string | null): string | null {
  if (!value) return null;
  if (!URL_RE.test(value)) return null;
  return value;
}

export async function updateProfile(formData: FormData) {
  const session = await requireAdmin("member");
  const supabase = await createServerSupabaseClient();

  const fullName = (formData.get("full_name") as string)?.trim();
  if (!fullName) return { error: "Full name is required." };

  const bio = (formData.get("bio") as string)?.trim() || null;
  const college = (formData.get("college") as string)?.trim() || null;
  const branch = (formData.get("branch") as string)?.trim() || null;
  const gradYearRaw = formData.get("graduation_year") as string;
  const graduationYear = gradYearRaw ? parseInt(gradYearRaw, 10) : null;
  if (graduationYear !== null && (isNaN(graduationYear) || graduationYear < 2000 || graduationYear > 2040)) {
    return { error: "Graduation year must be between 2000 and 2040." };
  }

  const skillsRaw = (formData.get("skills") as string)?.trim() ?? "";
  const skills = skillsRaw ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const githubUrl = validateUrl((formData.get("github_url") as string)?.trim() || null);
  const linkedinUrl = validateUrl((formData.get("linkedin_url") as string)?.trim() || null);
  const instagramUrl = validateUrl((formData.get("instagram_url") as string)?.trim() || null);
  const xUrl = validateUrl((formData.get("x_url") as string)?.trim() || null);
  const portfolioUrl = validateUrl((formData.get("portfolio_url") as string)?.trim() || null);
  const contactNumber = (formData.get("contact_number") as string)?.trim() || null;
  const publicProfile = formData.get("public_profile") === "on";

  const { error } = await supabase
    .from("profiles")
    .upsert({
      user_id: session.userId,
      full_name: fullName,
      bio,
      college,
      branch,
      graduation_year: graduationYear,
      skills,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      instagram_url: instagramUrl,
      x_url: xUrl,
      portfolio_url: portfolioUrl,
      contact_number: contactNumber,
      public_profile: publicProfile,
    });

  if (error) return { error: error.message };

  await writeAuditLog(session.userId, {
    action: "profile.update",
    targetType: "profile",
    targetId: session.userId,
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const session = await requireAdmin("member");
  const supabase = await createServerSupabaseClient();

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  if (file.size > 5 * 1024 * 1024) return { error: "File too large (max 5 MB)." };

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return { error: "Only JPEG, PNG, and WebP images are allowed." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `avatars/${session.userId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("community-media")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data: publicUrl } = supabase.storage
    .from("community-media")
    .getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl.publicUrl })
    .eq("user_id", session.userId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/profile");
  return { success: true, avatarUrl: publicUrl.publicUrl };
}
