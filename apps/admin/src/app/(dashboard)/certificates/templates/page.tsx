import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { Plus, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TemplatesPage() {
  await requirePermission("certificates.view");
  const supabase = await createServerSupabaseClient();

  const { data: templates } = await supabase
    .from("certificate_templates")
    .select("id, name, description, status, canvas_width, canvas_height, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">
            Certificate Templates
          </h1>
          <p className="text-sm text-brand-muted">
            Design and manage certificate layouts
          </p>
        </div>
        <Button asChild>
          <Link href="/certificates/templates/new">
            <Plus className="h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutTemplate className="mx-auto h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm text-brand-muted">
              No templates yet.
            </p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/certificates/templates/new">
                <Plus className="h-3.5 w-3.5" />
                Create your first template
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="font-medium text-brand-text">
                      {template.name}
                    </div>
                    {template.description && (
                      <p className="mt-0.5 text-xs text-brand-muted line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-brand-muted md:table-cell">
                    {template.canvas_width}×{template.canvas_height}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        template.status === "active"
                          ? "published"
                          : template.status === "archived"
                            ? "secondary"
                            : "draft"
                      }
                    >
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/certificates/templates/${template.id}/edit`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
