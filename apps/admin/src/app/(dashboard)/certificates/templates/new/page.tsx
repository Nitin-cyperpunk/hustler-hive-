import { requireAdmin } from "@/lib/auth";
import { TemplateForm } from "../template-form";

export default async function NewTemplatePage() {
  await requireAdmin("super_admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">New Template</h1>
        <p className="text-sm text-brand-muted">
          Upload a background image and configure text placement
        </p>
      </div>
      <TemplateForm />
    </div>
  );
}
