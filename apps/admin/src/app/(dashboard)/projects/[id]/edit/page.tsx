import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { ProjectForm } from "@/components/project-form";
import { updateProject } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("projects.update");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateProject(id, formData);
  }

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-white">Edit Project</h1>
      <ProjectForm project={project} action={handleUpdate} />
    </div>
  );
}
