import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { formatDate, isUpcoming } from "@/lib/format";
import { eventCoverUrl } from "@/lib/storage";
import type { Database } from "@hustlers-hive/shared";

type Event = Database["public"]["Tables"]["events"]["Row"];

export function EventsPreview({ events }: { events: Event[] }) {
  return (
    <section id="whats-next" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">
                Up Next
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Good things are in the{" "}
                <span className="text-brand-cyan">works.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mt-3 max-w-lg text-brand-muted">
                We&apos;re lining up opportunities to meet, learn, share ideas,
                and build alongside fellow student technologists.
              </p>
            </ScrollReveal>
          </div>
          {events.length > 0 && (
            <ScrollReveal delay={0.15}>
              <Link
                href="/events"
                className="group hidden items-center gap-1 text-sm font-medium text-brand-cyan sm:inline-flex"
              >
                View all events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </ScrollReveal>
          )}
        </div>

        {events.length === 0 ? (
          <ScrollReveal delay={0.2}>
            <div className="mt-12 rounded-2xl border border-brand-border bg-brand-surface/30 p-10 text-center sm:p-14">
              <Calendar className="mx-auto h-10 w-10 text-brand-cyan/30" />
              <h3 className="mt-4 text-lg font-semibold">
                Our next meetup is taking shape.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-brand-muted">
                The team is lining up the next set of community events. Check
                back soon, or join the community to hear about new plans.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                Events being lined up
              </span>
              <div className="mt-6">
                <Link
                  href="/community"
                  className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
                >
                  Join the Community
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerChildren className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const upcoming = isUpcoming(event.starts_at);
              const coverUrl = eventCoverUrl(event.cover_image_path);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:shadow-xl hover:shadow-brand-cyan/5"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-bg-secondary">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Calendar className="h-10 w-10 text-brand-border" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/70 via-transparent to-transparent" />
                    {/* Status badge */}
                    <div className="absolute left-3 top-3">
                      {upcoming ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cyan/90 px-3 py-1 text-xs font-semibold text-brand-bg backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-bg" />
                          Upcoming
                        </span>
                      ) : event.status === "completed" ? (
                        <span className="inline-flex items-center rounded-full bg-brand-yellow/90 px-3 py-1 text-xs font-semibold text-brand-bg backdrop-blur-sm">
                          Completed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-brand-cyan">
                      {event.title}
                    </h3>
                    {event.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-brand-muted">
                        {event.summary}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex flex-wrap gap-3 text-xs text-brand-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-brand-cyan/70" />
                          {formatDate(event.starts_at)}
                        </span>
                        {event.location_name && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-brand-cyan/70" />
                            {event.location_name}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-brand-muted transition-all group-hover:translate-x-1 group-hover:text-brand-cyan" />
                    </div>
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
