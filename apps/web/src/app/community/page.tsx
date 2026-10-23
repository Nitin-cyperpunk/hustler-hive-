import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, MessageCircle, Github, Users, Heart } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { ICONS, TEXTURES, BRAND } from "@/lib/assets";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustler-hive-ten.vercel.app";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join Hustlers Hive — connect with student developers, designers, and builders in Nashik.",
  alternates: { canonical: `${SITE_URL}/community` },
};

export const revalidate = 60;

export default async function CommunityPage() {
  const settings = await getSiteSettings();
  const whatsappUrl = settings.whatsapp_invite_url;
  const socials = settings.social_links ?? {};

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: `url(${TEXTURES.cyanGlow})`, backgroundSize: "cover" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-brand-bg/80" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Image
              src={BRAND.logoFull}
              alt=""
              width={64}
              height={64}
              className="mb-4 h-16 w-16"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
              Community
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Join the <span className="text-brand-cyan">Hive</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-brand-muted">
              {settings.community_intro ||
                "Whether you're just starting out or you've been coding for years — you belong here. Connect, collaborate, and grow with us."}
            </p>
          </div>
        </section>

        {/* Join channels */}
        <section className="bg-brand-bg-secondary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">Ways to connect</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-green-400/30 hover:shadow-lg hover:shadow-green-400/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-green-400/10 p-2.5">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold">WhatsApp Group</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Our primary space for quick updates, event announcements, and casual
                    tech discussions.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-green-400">
                    Join now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              )}

              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-brand-text/30 hover:shadow-lg hover:shadow-brand-text/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-brand-text/10 p-2.5">
                    <Github className="h-5 w-5 text-brand-text" />
                  </div>
                  <h3 className="font-semibold">GitHub</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Explore our repositories, contribute to projects, and open issues.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-text">
                    View repos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              )}

              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-pink-400/30 hover:shadow-lg hover:shadow-pink-400/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-pink-400/10 p-2.5">
                    <Image src={ICONS.social.instagram} alt="" width={20} height={20} className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">Instagram</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Follow us for event recaps, behind-the-scenes, and community highlights.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-pink-400">
                    Follow us <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              )}

              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-400/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-blue-400/10 p-2.5">
                    <Image src={ICONS.social.linkedin} alt="" width={20} height={20} className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">LinkedIn</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Connect professionally and stay updated on community milestones.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-400">
                    Connect <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              )}

              {socials.x && (
                <a
                  href={socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all hover:-translate-y-1 hover:border-brand-text/30 hover:shadow-lg hover:shadow-brand-text/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-brand-text/10 p-2.5">
                    <Image src={ICONS.social.x} alt="" width={20} height={20} className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">X (Twitter)</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Follow for tech threads, event live-tweets, and community updates.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-text">
                    Follow us <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold">How it works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Users,
                  title: "Join",
                  desc: "Hop into our WhatsApp group or follow us on socials.",
                },
                {
                  step: "02",
                  icon: Heart,
                  title: "Participate",
                  desc: "Attend events, join project teams, or propose your own ideas.",
                },
                {
                  step: "03",
                  icon: ArrowRight,
                  title: "Grow",
                  desc: "Build your skills, portfolio, and network — all while in college.",
                },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-brand-border bg-brand-surface/50 p-6">
                  <span className="text-xs font-bold text-brand-cyan">{item.step}</span>
                  <div className="mt-3 mb-3 inline-flex rounded-lg bg-brand-cyan/10 p-2">
                    <item.icon className="h-5 w-5 text-brand-cyan" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-brand-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
