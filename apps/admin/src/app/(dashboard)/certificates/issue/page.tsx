import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { IssueForm } from "./issue-form";

export default async function IssueCertificatesPage() {
  await requireAdmin("operations");
  const supabase = await createServerSupabaseClient();

  const { data: templates } = await supabase
    .from("certificate_templates")
    .select("id, name, canvas_width, canvas_height, design_config, background_storage_path")
    .eq("status", "active")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">
          Issue Certificates
        </h1>
        <p className="text-sm text-brand-muted">
          Add recipients manually or import a CSV, then generate certificates
        </p>
      </div>
      <IssueForm templates={templates ?? []} />
    </div>
  );
}
