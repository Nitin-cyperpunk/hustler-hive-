import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Plus, Award, LayoutTemplate, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function CertificatesPage() {
  await requireAdmin("core_team");
  const supabase = await createServerSupabaseClient();

  const [templatesRes, batchesRes, certsRes] = await Promise.all([
    supabase
      .from("certificate_templates")
      .select("id, status", { count: "exact" }),
    supabase
      .from("certificate_batches")
      .select("id, status, total_count, success_count", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("certificates")
      .select("id, status", { count: "exact" }),
  ]);

  const templates = templatesRes.data ?? [];
  const activeTemplates = templates.filter((t) => t.status === "active").length;

  const batches = batchesRes.data ?? [];

  const certificates = certsRes.data ?? [];
  const validCerts = certificates.filter((c) => c.status === "valid").length;
  const revokedCerts = certificates.filter((c) => c.status === "revoked").length;

  const stats = [
    {
      label: "Templates",
      value: templates.length,
      detail: `${activeTemplates} active`,
      icon: LayoutTemplate,
      color: "text-brand-cyan",
    },
    {
      label: "Batches",
      value: batches.length,
      icon: FileStack,
      color: "text-brand-yellow",
    },
    {
      label: "Certificates Issued",
      value: validCerts,
      icon: Award,
      color: "text-brand-success",
    },
    {
      label: "Revoked",
      value: revokedCerts,
      icon: Award,
      color: "text-brand-error",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">Certificates</h1>
          <p className="text-sm text-brand-muted">
            Manage templates, issue certificates, and track verification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/certificates/templates">
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/certificates/issue">
              <Plus className="h-4 w-4" />
              Issue Certificates
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {"detail" in stat && stat.detail && (
                <p className="text-xs text-brand-muted">{stat.detail}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {batches.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text">
              Recent Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batches.map((batch) => (
                <Link
                  key={batch.id}
                  href={`/certificates/batches/${batch.id}`}
                  className="flex items-center justify-between rounded-lg border border-brand-border p-3 transition-colors hover:bg-brand-surface"
                >
                  <div className="flex items-center gap-3">
                    <FileStack className="h-4 w-4 text-brand-muted" />
                    <span className="text-sm text-brand-text">
                      {batch.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-muted">
                      {batch.success_count}/{batch.total_count} issued
                    </span>
                    <Badge
                      variant={
                        batch.status === "completed"
                          ? "success"
                          : batch.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {batch.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto h-8 w-8 text-brand-muted" />
            <CardDescription className="mt-3">
              No certificates issued yet. Start by creating a template, then
              issue certificates.
            </CardDescription>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/certificates/templates/new">
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  Create Template
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
