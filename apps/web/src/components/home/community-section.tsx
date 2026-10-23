"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { ICONS, ILLUSTRATIONS } from "@/lib/assets";

const CYAN_FILTER =
  "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)";

const features = [
  {
    icon: ICONS.features.workshop,
    title: "Learn",
    description:
      "Discover tools, technologies, and ideas alongside fellow students.",
  },
  {
    icon: ICONS.features.code,
    title: "Build",
    description:
      "Work on practical projects and turn concepts into working products.",
  },
  {
    icon: ICONS.features.community,
    title: "Collaborate",
    description:
      "Find peers with complementary skills and shared interests.",
  },
  {
    icon: ICONS.features.arrowUpRight,
    title: "Grow",
    description:
      "Share progress, learn from feedback, and build confidence.",
  },
];

export function CommunitySection() {
  return (
    <section className="relative overflow-hidden bg-brand-bg-secondary py-20 sm:py-28">
      <Image
        src={ILLUSTRATIONS.underlineCyan}
        alt=""
        width={200}
        height={30}
        className="pointer-events-none absolute left-8 top-20 w-32 opacity-[0.06]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">
              Your people. Your next idea.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              You don&apos;t have to build{" "}
              <span className="text-brand-yellow">alone.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              Whether you&apos;re exploring your first programming language,
              contributing to open source, designing an interface, or shipping
              your next project, there&apos;s room to grow together.
            </p>
          </ScrollReveal>
        </div>

        <StaggerChildren className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-brand-border bg-brand-surface/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-cyan/20 hover:shadow-lg hover:shadow-brand-cyan/5"
            >
              <div className="mb-3 inline-flex rounded-lg bg-brand-cyan/10 p-2.5">
                <Image
                  src={f.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                  style={{ filter: CYAN_FILTER }}
                />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                {f.description}
              </p>
            </div>
          ))}
        </StaggerChildren>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <Link
              href="/community"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
            >
              Join Hustlers Hive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
