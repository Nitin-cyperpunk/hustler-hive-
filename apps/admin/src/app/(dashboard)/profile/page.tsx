import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await requireAdmin("member");
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id, full_name, avatar_url, bio, college, branch, graduation_year, skills, github_url, linkedin_url, instagram_url, x_url, portfolio_url, contact_number, public_profile, created_at, updated_at"
    )
    .eq("user_id", session.userId)
    .single();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, department, status")
    .eq("user_id", session.userId)
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">My Profile</h1>
        <p className="text-sm text-brand-muted">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileForm
        profile={
          profile
            ? {
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url ?? null,
                bio: profile.bio ?? "",
                college: profile.college ?? "",
                branch: profile.branch ?? "",
                graduationYear: profile.graduation_year ?? null,
                skills: profile.skills ?? [],
                githubUrl: profile.github_url ?? "",
                linkedinUrl: profile.linkedin_url ?? "",
                instagramUrl: profile.instagram_url ?? "",
                xUrl: profile.x_url ?? "",
                portfolioUrl: profile.portfolio_url ?? "",
                contactNumber: profile.contact_number ?? "",
                publicProfile: profile.public_profile ?? false,
              }
            : null
        }
        role={adminUser?.role ?? session.role}
        department={(adminUser?.department as string) ?? null}
      />
    </div>
  );
}
