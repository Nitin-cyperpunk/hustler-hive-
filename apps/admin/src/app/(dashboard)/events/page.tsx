import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function EventsPage() {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, location_name, status, featured")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-brand-text">Events</h1>
          <p className="text-sm text-brand-muted">Manage community events, meetups, and workshops</p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm text-brand-muted">No events yet.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/events/new">
                <Plus className="h-3.5 w-3.5" />
                Create your first event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="font-medium text-brand-text">{event.title}</div>
                    {event.featured && (
                      <Badge variant="warning" className="mt-1">Featured</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-brand-muted md:table-cell">
                    {new Date(event.starts_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="hidden text-brand-muted lg:table-cell">
                    {event.location_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.status === "published" ? "published" : event.status === "completed" ? "success" : "draft"}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/events/${event.id}/edit`}>Edit</Link>
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
