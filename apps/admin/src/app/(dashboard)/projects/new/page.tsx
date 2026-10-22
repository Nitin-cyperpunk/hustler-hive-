import { requireAdmin } from "@/lib/auth";
import { ProjectForm } from "@/components/project-form";
import { createProject } from "../actions";

export default async function NewProjectPage() {
  await requireAdmin("editor");

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-white">Create Project</h1>
      <ProjectForm action={createProject} />
    </div>
  );
}
