import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getEventBySlug } from "@/lib/supabase/queries";
import { formatDateRange, isUpcoming } from "@/lib/format";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary ?? `${event.title} — an event by Hustlers Hive.`,
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const upcoming = isUpcoming(event.starts_at);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <article className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-cyan"
            >
              <ArrowLeft className="h-4 w-4" />
              All Events
            </Link>

            <div className="mt-8">
              {upcoming && (
                <span className="mb-4 inline-block rounded-full bg-brand-cyan/10 px-3 py-1 text-xs font-medium text-brand-cyan">
                  Upcoming
                </span>
              )}
              {!upcoming && event.status === "completed" && (
                <span className="mb-4 inline-block rounded-full bg-brand-yellow/10 px-3 py-1 text-xs font-medium text-brand-yellow">
                  Completed
                </span>
              )}

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-brand-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-cyan" />
                  {formatDateRange(event.starts_at, event.ends_at)}
                </span>
                {event.location_name && (
                  <span className="inline-flex items-center gap-1.5">
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
                    className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
                  >
                    Register Now
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {event.summary && (
                <p className="mt-8 text-lg leading-relaxed text-brand-muted">
                  {event.summary}
                </p>
              )}

              {event.description && (
                <div className="mt-6 whitespace-pre-wrap leading-relaxed text-brand-muted/90">
                  {event.description}
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
