import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Calendar, FolderKanban, Images, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    { label: "Published Events", value: publishedEvents, icon: Calendar, color: "text-brand-cyan" },
    { label: "Upcoming Events", value: upcomingEvents, icon: Calendar, color: "text-brand-success" },
    { label: "Draft Events", value: draftEvents, icon: FileText, color: "text-brand-yellow" },
    { label: "Published Projects", value: publishedProjects, icon: FolderKanban, color: "text-brand-cyan" },
    { label: "Gallery Images", value: publishedGallery, icon: Images, color: "text-purple-400" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-brand-text">Welcome back</h1>
        <p className="text-sm text-brand-muted">
          Signed in as {session.email} ({session.role.replace("_", " ")})
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-brand-muted">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-text">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && projects.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-brand-muted">
              No content yet. Start by creating your first event or project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
