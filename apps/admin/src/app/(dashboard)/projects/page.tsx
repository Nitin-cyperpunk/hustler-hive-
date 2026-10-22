import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Plus, FolderKanban } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export default async function ProjectsPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, status, featured, technologies")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Projects</h1>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-[#0D1422] p-12 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-3 text-sm text-gray-500">No projects yet.</p>
          <Link
            href="/projects/new"
            className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0D1422]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Technologies</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{project.title}</div>
                    {project.featured && (
                      <span className="text-xs text-yellow-400">Featured</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(project.technologies ?? []).slice(0, 3).map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
