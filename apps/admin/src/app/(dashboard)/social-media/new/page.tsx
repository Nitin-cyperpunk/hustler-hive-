import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NewPostForm } from "./new-post-form";

export default async function NewSocialPostPage() {
  await requirePermission("social.create");
  const supabase = await createServerSupabaseClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">Create Post</h1>
        <p className="text-sm text-brand-muted">
          Plan a new social media post
        </p>
      </div>

      <NewPostForm events={events ?? []} />
    </div>
  );
}
