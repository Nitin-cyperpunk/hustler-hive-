import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, ExternalLink, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { getEventBySlug } from "@/lib/supabase/queries";
import { formatDateRange, isUpcoming } from "@/lib/format";
import { eventCoverUrl } from "@/lib/storage";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustlerhive.vercel.app";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  const coverUrl = eventCoverUrl(event.cover_image_path);
  return {
    title: event.title,
    description: event.summary ?? `${event.title} — an event by Hustlers Hive.`,
    alternates: { canonical: `${SITE_URL}/events/${slug}` },
    openGraph: {
      title: event.title,
      description: event.summary ?? `${event.title} — an event by Hustlers Hive.`,
      type: "article",
      ...(coverUrl ? { images: [{ url: coverUrl, width: 1200, height: 630 }] } : {}),
    },
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const upcoming = isUpcoming(event.starts_at);
  const coverUrl = eventCoverUrl(event.cover_image_path);

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary ?? event.title,
    startDate: event.starts_at,
    ...(event.ends_at ? { endDate: event.ends_at } : {}),
    ...(event.location_name
      ? {
          location: {
            "@type": "Place",
            name: event.location_name,
          },
        }
      : {}),
    ...(coverUrl ? { image: coverUrl } : {}),
    organizer: {
      "@type": "Organization",
      name: "Hustlers Hive",
      url: SITE_URL,
    },
    url: `${SITE_URL}/events/${event.slug}`,
    eventStatus: "https://schema.org/EventScheduled",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={eventLd} />
      <Header />
      <main className="flex-1">
        {/* Hero with poster */}
        <section className="relative">
          {coverUrl ? (
            <div className="relative h-[280px] sm:h-[380px] lg:h-[460px] w-full overflow-hidden">
              <Image
                src={coverUrl}
                alt={event.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-brand-bg/20" />
            </div>
          ) : (
            <div className="h-[120px] sm:h-[160px] bg-gradient-to-b from-brand-surface to-brand-bg" />
          )}

          {/* Event info overlay */}
          <div
            className={`relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 ${
              coverUrl ? "-mt-32 sm:-mt-40" : "pt-8 sm:pt-12"
            }`}
          >
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-cyan"
            >
              <ArrowLeft className="h-4 w-4" />
              All Events
            </Link>

            <div className="mt-6">
              {upcoming ? (
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-cyan/90 px-3 py-1 text-xs font-semibold text-brand-bg">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-bg" />
                  Upcoming
                </span>
              ) : event.status === "completed" ? (
                <span className="mb-4 inline-flex items-center rounded-full bg-brand-yellow/90 px-3 py-1 text-xs font-semibold text-brand-bg">
                  Completed
                </span>
              ) : null}

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-2 rounded-lg bg-brand-surface/80 px-3 py-2 text-brand-text backdrop-blur-sm">
                  <Calendar className="h-4 w-4 text-brand-cyan" />
                  {formatDateRange(event.starts_at, event.ends_at)}
                </span>
                {event.location_name && (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-brand-surface/80 px-3 py-2 text-brand-text backdrop-blur-sm">
                    <MapPin className="h-4 w-4 text-brand-cyan" />
                    {event.location_name}
                  </span>
                )}
              </div>

              {event.registration_url && upcoming && (
                <div className="mt-6">
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/25"
                  >
                    Register Now
                    <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="py-10 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-brand-border bg-brand-surface/30 p-6 sm:p-8">
              {event.summary && (
                <p className="text-lg leading-relaxed text-brand-muted">
                  {event.summary}
                </p>
              )}

              {event.description && (
                <div
                  className={`whitespace-pre-wrap leading-relaxed text-brand-muted/90 ${
                    event.summary ? "mt-6 border-t border-brand-border pt-6" : ""
                  }`}
                >
                  {event.description}
                </div>
              )}

              {!event.summary && !event.description && (
                <div className="flex flex-col items-center py-8 text-center">
                  <Clock className="h-8 w-8 text-brand-muted/40" />
                  <p className="mt-3 text-brand-muted">
                    Details for this event will be updated soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
