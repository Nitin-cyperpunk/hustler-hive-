import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  await requirePermission("settings.manage");
  const supabase = await createServerSupabaseClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("content")
    .eq("id", 1)
    .single();

  const content = (settings?.content ?? {}) as Record<string, unknown>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">Site Settings</h1>
        <p className="text-sm text-brand-muted">Configure public website content</p>
      </div>

      <SettingsForm content={content} />
    </div>
  );
}
