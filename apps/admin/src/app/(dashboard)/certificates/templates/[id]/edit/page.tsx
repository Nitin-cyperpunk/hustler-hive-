import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { TemplateForm } from "../../template-form";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("certificates.manage");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: template } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (!template) notFound();

  const { data: urlData } = supabase.storage
    .from("certificates")
    .getPublicUrl(template.background_storage_path);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">Edit Template</h1>
        <p className="text-sm text-brand-muted">{template.name}</p>
      </div>
      <TemplateForm
        template={{
          ...template,
          design_config: template.design_config as Record<string, unknown>,
        }}
        backgroundUrl={urlData.publicUrl}
      />
    </div>
  );
}
