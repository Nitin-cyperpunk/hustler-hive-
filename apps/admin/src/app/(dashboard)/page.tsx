import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  Calendar,
  FolderKanban,
  Images,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const publishedProjects = projects.filter(
    (p) => p.status === "published"
  ).length;

  const gallery = galleryRes.data ?? [];
  const publishedGallery = gallery.filter(
    (g) => g.status === "published"
  ).length;

  const stats = [
    {
      label: "Published Events",
      value: publishedEvents,
      icon: Calendar,
      color: "text-brand-cyan",
    },
    {
      label: "Upcoming",
      value: upcomingEvents,
      icon: TrendingUp,
      color: "text-brand-success",
    },
    {
      label: "Drafts",
      value: draftEvents,
      icon: FileText,
      color: "text-brand-yellow",
    },
    {
      label: "Projects",
      value: publishedProjects,
      icon: FolderKanban,
      color: "text-brand-cyan",
    },
    {
      label: "Gallery",
      value: publishedGallery,
      icon: Images,
      color: "text-purple-400",
    },
  ];

  const totalContent = events.length + projects.length + gallery.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-brand-text">
          Welcome back
        </h1>
        <p className="text-sm text-brand-muted">
          Signed in as {session.email}{" "}
          <Badge variant="secondary" className="ml-1 capitalize">
            {session.role.replace("_", " ")}
          </Badge>
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
              <div className="text-2xl font-bold text-brand-text">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalContent === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <CardDescription className="text-sm">
              No content yet. Start by creating your first event or project
              from the sidebar.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
