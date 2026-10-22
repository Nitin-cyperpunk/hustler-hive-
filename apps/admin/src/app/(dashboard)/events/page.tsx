import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Plus, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

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
        <h1 className="text-lg font-bold text-white">Events</h1>
        <Link
          href="/events/new"
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          New Event
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-[#0D1422] p-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-gray-600" />
          <p className="mt-3 text-sm text-gray-500">No events yet.</p>
          <Link
            href="/events/new"
            className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0D1422]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-gray-500">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Date</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{event.title}</div>
                    {event.featured && (
                      <span className="text-xs text-yellow-400">Featured</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                    {new Date(event.starts_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                    {event.location_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/events/${event.id}/edit`}
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
