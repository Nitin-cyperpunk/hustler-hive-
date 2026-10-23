import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustlerhive.vercel.app";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Hustlers Hive — questions, collaborations, or just say hi.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_invite_url;
  const socials = settings.social_links ?? {};

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: `url(${TEXTURES.darkGrain})`, backgroundSize: "cover" }}
          />
          <Image
            src={ILLUSTRATIONS.circuitCorner}
            alt=""
            width={160}
            height={160}
            className="pointer-events-none absolute right-0 top-0 w-28 opacity-5 sm:w-36"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
              Contact
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-brand-muted">
              Have a question, want to collaborate, or just want to say hi?
              We&apos;d love to hear from you.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-brand-border bg-brand-surface/50 p-6">
                <div className="mb-4 inline-flex rounded-lg bg-brand-cyan/10 p-2.5">
                  <Mail className="h-5 w-5 text-brand-cyan" />
                </div>
                <h3 className="font-semibold">Email</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  For collaborations, sponsorships, or general inquiries.
                </p>
                <a
                  href="mailto:hello@hustlershive.in"
                  className="mt-3 inline-block text-sm font-medium text-brand-cyan transition-colors hover:text-brand-cyan/80"
                >
                  hello@hustlershive.in
                </a>
              </div>

              {whatsappUrl && (
                <div className="rounded-xl border border-brand-border bg-brand-surface/50 p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-green-400/10 p-2.5">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold">WhatsApp</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Join our community group for quick questions and updates.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-green-400 transition-colors hover:text-green-400/80"
                  >
                    Join group
                  </a>
                </div>
              )}

              <div className="rounded-xl border border-brand-border bg-brand-surface/50 p-6">
                <div className="mb-4 inline-flex rounded-lg bg-brand-yellow/10 p-2.5">
                  <MapPin className="h-5 w-5 text-brand-yellow" />
                </div>
                <h3 className="font-semibold">Location</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Based in Nashik, Maharashtra. We meet at various college campuses
                  and co-working spaces.
                </p>
                <span className="mt-3 inline-block text-sm text-brand-muted/80">
                  Nashik, Maharashtra, India
                </span>
              </div>
            </div>

            {/* Social links */}
            {Object.keys(socials).length > 0 && (
              <div className="mt-16">
                <h2 className="text-xl font-semibold">Follow us</h2>
                <p className="mt-2 text-brand-muted">
                  Stay connected through our social channels.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {Object.entries(socials).map(([key, url]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-4 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </a>
                    );
                  })}
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
