import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Calendar, FolderKanban, Images, FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const [eventsRes, projectsRes, galleryRes] = await Promise.all([
    supabase.from("events").select("id, status, starts_at", { count: "exact" }),
    supabase.from("projects").select("id, status", { count: "exact" }),
    supabase.from("gallery_images").select("id, status", { count: "exact" }),
  ]);

  const events = eventsRes.data ?? [];
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const draftEvents = events.filter((e) => e.status === "draft").length;
  const upcomingEvents = events.filter(
    (e) => e.status === "published" && new Date(e.starts_at) > new Date()
  ).length;

  const projects = projectsRes.data ?? [];
  const publishedProjects = projects.filter((p) => p.status === "published").length;

  const gallery = galleryRes.data ?? [];
  const publishedGallery = gallery.filter((g) => g.status === "published").length;

  const stats = [
    { label: "Published Events", value: publishedEvents, icon: Calendar, color: "text-cyan-400" },
    { label: "Upcoming Events", value: upcomingEvents, icon: Calendar, color: "text-green-400" },
    { label: "Draft Events", value: draftEvents, icon: FileText, color: "text-yellow-400" },
    { label: "Published Projects", value: publishedProjects, icon: FolderKanban, color: "text-cyan-400" },
    { label: "Gallery Images", value: publishedGallery, icon: Images, color: "text-purple-400" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Welcome back</h1>
        <p className="text-sm text-gray-500">
          Signed in as {session.email} ({session.role.replace("_", " ")})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/5 bg-[#0D1422] p-4"
          >
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {events.length === 0 && projects.length === 0 && (
        <div className="mt-8 rounded-xl border border-white/5 bg-[#0D1422] p-8 text-center">
          <p className="text-sm text-gray-500">
            No content yet. Start by creating your first event or project.
          </p>
        </div>
      )}
    </div>
  );
}
