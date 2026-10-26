import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublishedEvents } from "@/lib/supabase/queries";
import { formatDate, isUpcoming } from "@/lib/format";
import { eventCoverUrl } from "@/lib/storage";
import { ICONS, TEXTURES } from "@/lib/assets";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustlerhive.vercel.app";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Discover upcoming and past events organized by Hustlers Hive — meetups, hackathons, workshops, and more in Nashik.",
  alternates: { canonical: `${SITE_URL}/events` },
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const upcoming = events.filter((e) => isUpcoming(e.starts_at));
  const past = events.filter((e) => !isUpcoming(e.starts_at));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${TEXTURES.darkGrain})`,
              backgroundSize: "cover",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Image
                src={ICONS.features.events}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
                style={{
                  filter:
                    "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)",
                }}
              />
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
                Events
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Meetups, hackathons &amp; workshops
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-brand-muted">
              From casual tech talks to intense build weekends — here&apos;s
              what we&apos;ve been up to.
            </p>

            {events.length === 0 && (
              <div className="mt-16 rounded-xl border border-dashed border-brand-border p-16 text-center">
                <Calendar className="mx-auto h-12 w-12 text-brand-muted/40" />
                <p className="mt-4 text-lg text-brand-muted">
                  No events yet. We&apos;re planning something — check back
                  soon!
                </p>
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-brand-yellow">
                  Upcoming
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div className="mt-16">
                <h2 className="text-xl font-semibold text-brand-muted">
                  Past Events
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EventCard({
  event,
}: {
  event: Awaited<ReturnType<typeof getPublishedEvents>>[number];
}) {
  const upcoming = isUpcoming(event.starts_at);
  const coverUrl = eventCoverUrl(event.cover_image_path);

  return (
    <Link
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
            <Calendar className="h-12 w-12 text-brand-border" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 via-transparent to-transparent" />
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
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-muted">
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
}
