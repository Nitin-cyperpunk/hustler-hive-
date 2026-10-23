"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { ILLUSTRATIONS } from "@/lib/assets";

const themes = [
  { label: "Ideas in progress", icon: "💡" },
  { label: "Formats being explored", icon: "🧪" },
  { label: "Community collaboration", icon: "🤝" },
];

export function HackathonSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <Image
        src={ILLUSTRATIONS.circuitCorner}
        alt=""
        width={200}
        height={200}
        className="pointer-events-none absolute right-0 top-0 w-40 opacity-[0.04] sm:w-56"
        aria-hidden="true"
      />
      <Image
        src={ILLUSTRATIONS.stars}
        alt=""
        width={100}
        height={100}
        className="pointer-events-none absolute left-8 top-12 opacity-[0.06]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">
              Build Something Bold
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Hackathons are in the{" "}
              <span className="text-brand-yellow">planning phase.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-5 text-lg leading-relaxed text-brand-muted">
              We&apos;re exploring ways to bring students together to turn ideas
              into prototypes, experiment with technology, and build things that
              matter.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-yellow/20 bg-brand-yellow/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-yellow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />
              In Planning
            </span>
          </ScrollReveal>
        </div>

        <StaggerChildren className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {themes.map((t) => (
            <div
              key={t.label}
              className="rounded-xl border border-brand-border bg-brand-surface/30 p-5 text-center transition-colors hover:border-brand-cyan/20"
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="mt-2 text-sm font-medium text-brand-muted">
                {t.label}
              </p>
            </div>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.3}>
          <div className="mt-10 text-center">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/40 hover:text-brand-cyan"
            >
              Stay Connected
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
