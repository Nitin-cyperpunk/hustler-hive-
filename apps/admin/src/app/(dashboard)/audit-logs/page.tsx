import { requirePermission } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function AuditLogsPage() {
  await requirePermission("audit_logs.view");
  const supabase = await createServerSupabaseClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, actor_id, action, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const actorIds = [...new Set((logs ?? []).map((l) => l.actor_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", actorIds.length > 0 ? actorIds : ["__none__"]);

  const nameMap = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-brand-text">Audit Logs</h1>
        <p className="text-sm text-brand-muted">
          Security-sensitive actions performed by team members.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!logs || logs.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-brand-muted">
                  No audit logs yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-brand-muted">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {nameMap.get(log.actor_id) ?? log.actor_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-brand-muted">
                    {log.target_type && (
                      <span>
                        {log.target_type}
                        {log.target_id ? `: ${log.target_id.slice(0, 8)}` : ""}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-brand-muted">
                    {log.metadata && typeof log.metadata === "object" && Object.keys(log.metadata).length > 0
                      ? JSON.stringify(log.metadata)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
