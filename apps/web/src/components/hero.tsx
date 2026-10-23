"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BRAND, TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${TEXTURES.cyanGlow})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-brand-bg/30 via-brand-bg/70 to-brand-bg" />

      <Image
        src={ILLUSTRATIONS.circuitCorner}
        alt=""
        width={200}
        height={200}
        className="pointer-events-none absolute right-0 top-0 w-40 opacity-10 sm:w-52"
        aria-hidden="true"
      />
      <Image
        src={ILLUSTRATIONS.circleDoodle}
        alt=""
        width={120}
        height={100}
        className="pointer-events-none absolute left-4 top-32 w-16 opacity-5 sm:w-24"
        aria-hidden="true"
      />
      <Image
        src={ILLUSTRATIONS.stars}
        alt=""
        width={100}
        height={70}
        className="pointer-events-none absolute bottom-40 right-12 opacity-5 sm:opacity-8"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <Image
              src={BRAND.logoFull}
              alt="Hustlers Hive"
              width={120}
              height={120}
              className="mx-auto mb-6 h-28 w-28 sm:h-32 sm:w-32"
              priority
            />
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <p className="mb-6 inline-block rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-sm font-medium text-brand-cyan">
              Nashik, Maharashtra
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Built by students.{" "}
              <span className="text-brand-cyan">For students.</span>{" "}
              <span className="text-brand-yellow">Run by students.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted sm:text-xl">
              A student-driven technology community — organizing meetups,
              hackathons, workshops, and open-source collaborations.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/community"
                className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
              >
                Join the Community
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-6 py-3.5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
              >
                Explore Events
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.45}>
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-brand-muted">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-text">50+</div>
                <div>Members</div>
              </div>
              <div className="h-8 w-px bg-brand-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-text">10+</div>
                <div>Events</div>
              </div>
              <div className="h-8 w-px bg-brand-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-text">5+</div>
                <div>Projects</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <Image
        src={ILLUSTRATIONS.godavariWaves}
        alt=""
        width={1200}
        height={120}
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-5"
        aria-hidden="true"
      />
    </section>
  );
}
