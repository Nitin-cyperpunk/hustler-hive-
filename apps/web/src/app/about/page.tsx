import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NASHIK, TEXTURES, ILLUSTRATIONS, ICONS, BRAND } from "@/lib/assets";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustlerhive.vercel.app";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Hustlers Hive — a student-driven technology community rooted in Nashik, Maharashtra.",
  alternates: { canonical: `${SITE_URL}/about` },
};

const values = [
  {
    icon: ICONS.features.community,
    title: "Student-Led",
    desc: "Everything is organized, built, and maintained by students — for students.",
    color: "text-brand-cyan",
  },
  {
    icon: ICONS.features.code,
    title: "Open Source",
    desc: "Our code, our content, and our learnings are open for everyone.",
    color: "text-brand-yellow",
  },
  {
    icon: ICONS.features.workshop,
    title: "Inclusive",
    desc: "No gatekeeping. Beginners and experienced builders learn together.",
    color: "text-brand-cyan",
  },
  {
    icon: ICONS.features.location,
    title: "Nashik-First",
    desc: "Rooted locally, connected globally. We're proud of where we come from.",
    color: "text-brand-yellow",
  },
];

const iconFilter =
  "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)";
const iconFilterYellow =
  "invert(82%) sepia(60%) saturate(500%) hue-rotate(5deg) brightness(105%)";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{ backgroundImage: `url(${TEXTURES.darkGrain})`, backgroundSize: "cover" }}
          />
          <Image
            src={ILLUSTRATIONS.circleDoodle}
            alt=""
            width={120}
            height={100}
            className="pointer-events-none absolute right-6 top-16 w-20 opacity-10 sm:w-28"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
              About Us
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              A community built on{" "}
              <span className="text-brand-cyan">curiosity</span> &amp;{" "}
              <span className="text-brand-yellow">collaboration</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
              Hustlers Hive started as a small group of students in Nashik who
              believed that the best way to learn technology is to build things
              together. Today, we&apos;re a growing community of makers, builders,
              and dreamers.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-brand-bg-secondary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Our Mission
                </h2>
                <p className="mt-4 leading-relaxed text-brand-muted">
                  To create an inclusive space where students can explore technology,
                  collaborate on real projects, and develop skills that matter —
                  regardless of their college, branch, or experience level.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    { text: "Organize hands-on tech events and workshops", icon: ICONS.features.events },
                    { text: "Build and ship open-source projects together", icon: ICONS.features.projects },
                    { text: "Connect students with mentors and opportunities", icon: ICONS.features.community },
                    { text: "Represent Nashik in the wider tech community", icon: ICONS.features.location },
                  ].map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-brand-muted">
                      <Image
                        src={item.icon}
                        alt=""
                        width={16}
                        height={16}
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ filter: iconFilter }}
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={NASHIK.godavariGhats}
                  alt="AI-generated cinematic view of Godavari ghats, Nashik"
                  width={600}
                  height={400}
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-bg/60 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Nashik connection */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <Image
            src={ILLUSTRATIONS.nashikHills}
            alt=""
            width={1000}
            height={360}
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-5"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="relative overflow-hidden rounded-xl">
                <Image
                  src={NASHIK.kalaramTemple}
                  alt="AI-generated cinematic view of Kalaram Temple, Nashik"
                  width={600}
                  height={400}
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-brand-bg/60 to-transparent" />
              </div>
              <div>
                <Image
                  src={ILLUSTRATIONS.templeLineArt}
                  alt=""
                  width={60}
                  height={60}
                  className="mb-4 opacity-30"
                  aria-hidden="true"
                />
                <h2 className="text-3xl font-bold tracking-tight">
                  Rooted in <span className="text-brand-yellow">Nashik</span>
                </h2>
                <p className="mt-4 leading-relaxed text-brand-muted">
                  Our city sits on the banks of the Godavari — a place of ancient
                  temples and new ambitions. We believe Nashik&apos;s student tech
                  scene deserves a spotlight, and we&apos;re building it.
                </p>
                <p className="mt-4 leading-relaxed text-brand-muted">
                  From campus labs to community meetups, we&apos;re creating the
                  infrastructure for student technologists to thrive right here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-brand-bg-secondary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              What drives us
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-xl border border-brand-border bg-brand-surface/50 p-6"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-brand-cyan/10 p-2">
                    <Image
                      src={value.icon}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5"
                      style={{
                        filter: value.color.includes("yellow") ? iconFilterYellow : iconFilter,
                      }}
                    />
                  </div>
                  <h3 className={`text-lg font-semibold ${value.color}`}>{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: `url(${TEXTURES.yellowGlow})`, backgroundSize: "cover" }}
          />
          <Image
            src={ILLUSTRATIONS.stars}
            alt=""
            width={100}
            height={70}
            className="pointer-events-none absolute left-8 top-8 opacity-10"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Image
              src={BRAND.logoFull}
              alt=""
              width={80}
              height={80}
              className="mx-auto mb-6 h-20 w-20"
              aria-hidden="true"
            />
            <h2 className="text-3xl font-bold tracking-tight">
              Want to be part of the hive?
            </h2>
            <p className="mt-4 text-brand-muted">
              We&apos;re always looking for curious minds. Join us and let&apos;s
              build something together.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/community"
                className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
              >
                Join the Community
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-lg border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
