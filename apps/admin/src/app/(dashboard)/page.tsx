import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin, hasMinRole } from "@/lib/auth";
import Link from "next/link";
import {
  Calendar,
  FolderKanban,
  Images,
  FileText,
  TrendingUp,
  CheckSquare,
  Wallet,
  Users,
  Megaphone,
  Award,
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

  const isAdmin = hasMinRole(session.role, "admin");
  const hasTasks = session.permissions.includes("tasks.view_assigned");
  const hasBudgets = session.permissions.includes("budgets.view");
  const hasSocial = session.permissions.includes("social.view");
  const hasCerts = session.permissions.includes("certificates.view");

  const [eventsRes, projectsRes, galleryRes] = await Promise.all([
    supabase.from("events").select("id, status, starts_at", { count: "exact" }),
    supabase.from("projects").select("id, status", { count: "exact" }),
    supabase.from("gallery_images").select("id, status", { count: "exact" }),
  ]);

  const events = eventsRes.data ?? [];
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const upcomingEvents = events.filter(
    (e) => e.status === "published" && new Date(e.starts_at) > new Date()
  ).length;

  const projects = projectsRes.data ?? [];
  const publishedProjects = projects.filter((p) => p.status === "published").length;

  const gallery = galleryRes.data ?? [];
  const publishedGallery = gallery.filter((g) => g.status === "published").length;

  let myTaskCount = 0;
  let pendingTaskCount = 0;
  if (hasTasks) {
    const { count: myTasks } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", session.userId)
      .in("status", ["todo", "in_progress", "blocked"]);
    myTaskCount = myTasks ?? 0;

    if (isAdmin) {
      const { count: pending } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "in_review");
      pendingTaskCount = pending ?? 0;
    }
  }

  let pendingExpenses = 0;
  let totalSpent = 0;
  if (hasBudgets) {
    const { count: pendingExp } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]);
    pendingExpenses = pendingExp ?? 0;

    const { data: approvedExpenses } = await supabase
      .from("expenses")
      .select("amount")
      .in("status", ["approved", "reimbursed"]);
    totalSpent = (approvedExpenses ?? []).reduce(
      (sum, e) => sum + Number(e.amount), 0
    );
  }

  let pendingPosts = 0;
  if (hasSocial) {
    const { count } = await supabase
      .from("social_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_review");
    pendingPosts = count ?? 0;
  }

  let teamCount = 0;
  let pendingInvites = 0;
  if (isAdmin) {
    const { count: members } = await supabase
      .from("admin_users")
      .select("user_id", { count: "exact", head: true })
      .eq("status", "active");
    teamCount = members ?? 0;

    const { count: invites } = await supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pendingInvites = invites ?? 0;
  }

  type Stat = { label: string; value: number | string; icon: typeof Calendar; color: string; href?: string };
  const stats: Stat[] = [
    { label: "Upcoming Events", value: upcomingEvents, icon: Calendar, color: "text-brand-cyan", href: "/events" },
    { label: "Published Events", value: publishedEvents, icon: TrendingUp, color: "text-brand-success", href: "/events" },
    { label: "Projects", value: publishedProjects, icon: FolderKanban, color: "text-brand-cyan", href: "/projects" },
    { label: "Gallery", value: publishedGallery, icon: Images, color: "text-purple-400", href: "/gallery" },
  ];

  if (hasTasks) {
    stats.push({ label: "My Active Tasks", value: myTaskCount, icon: CheckSquare, color: "text-blue-400", href: "/tasks" });
    if (isAdmin && pendingTaskCount > 0) {
      stats.push({ label: "Tasks In Review", value: pendingTaskCount, icon: FileText, color: "text-brand-yellow", href: "/tasks" });
    }
  }

  if (hasBudgets) {
    stats.push({ label: "Total Spent", value: `₹${totalSpent.toLocaleString("en-IN")}`, icon: Wallet, color: "text-green-400", href: "/finance" });
    if (pendingExpenses > 0) {
      stats.push({ label: "Pending Expenses", value: pendingExpenses, icon: Wallet, color: "text-orange-400", href: "/finance" });
    }
  }

  if (hasSocial && pendingPosts > 0) {
    stats.push({ label: "Posts In Review", value: pendingPosts, icon: Megaphone, color: "text-pink-400", href: "/social-media" });
  }

  if (isAdmin) {
    stats.push({ label: "Team Members", value: teamCount, icon: Users, color: "text-brand-cyan", href: "/team" });
    if (pendingInvites > 0) {
      stats.push({ label: "Pending Invites", value: pendingInvites, icon: Users, color: "text-brand-yellow", href: "/team" });
    }
  }

  if (hasCerts) {
    stats.push({ label: "Certificates", value: "", icon: Award, color: "text-amber-400", href: "/certificates" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-brand-text">
          Welcome back
        </h1>
        <p className="text-sm text-brand-muted">
          Signed in as {session.email}{" "}
          <Badge variant="secondary" className="ml-1 capitalize">
            {session.role.replace(/_/g, " ")}
          </Badge>
          {session.department && (
            <Badge variant="outline" className="ml-1 capitalize">
              {session.department.replace(/_/g, " ")}
            </Badge>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.filter((s) => s.value !== "").map((stat) => {
          const inner = (
            <Card className={stat.href ? "transition-colors hover:border-brand-cyan/30" : ""}>
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
          );
          if (stat.href) {
            return <Link key={stat.label} href={stat.href}>{inner}</Link>;
          }
          return <div key={stat.label}>{inner}</div>;
        })}
      </div>

      {events.length === 0 && projects.length === 0 && gallery.length === 0 && (
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
