import Link from "next/link";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { formatDate, isUpcoming } from "@/lib/format";
import type { Database } from "@hustlers-hive/shared";

type Event = Database["public"]["Tables"]["events"]["Row"];

export function EventsPreview({ events }: { events: Event[] }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <ScrollReveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
                Events
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Upcoming &amp; recent events
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <Link
              href="/events"
              className="group hidden items-center gap-1 text-sm font-medium text-brand-cyan sm:inline-flex"
            >
              View all events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </ScrollReveal>
        </div>

        {events.length === 0 ? (
          <ScrollReveal delay={0.2}>
            <div className="mt-12 rounded-xl border border-dashed border-brand-border p-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-brand-muted/40" />
              <p className="mt-3 text-brand-muted">
                No events yet. Check back soon!
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerChildren className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const upcoming = isUpcoming(event.starts_at);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5"
                >
                  {upcoming && (
                    <span className="mb-3 inline-block rounded-full bg-brand-cyan/10 px-3 py-0.5 text-xs font-medium text-brand-cyan">
                      Upcoming
                    </span>
                  )}
                  {!upcoming && event.status === "completed" && (
                    <span className="mb-3 inline-block rounded-full bg-brand-yellow/10 px-3 py-0.5 text-xs font-medium text-brand-yellow">
                      Completed
                    </span>
                  )}
                  <h3 className="text-lg font-semibold transition-colors group-hover:text-brand-cyan">
                    {event.title}
                  </h3>
                  {event.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-brand-muted">
                      {event.summary}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-brand-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(event.starts_at)}
                    </span>
                    {event.location_name && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location_name}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </StaggerChildren>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan"
          >
            View all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
