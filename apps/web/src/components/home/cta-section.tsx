"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${TEXTURES.cyanGradient})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-brand-bg/80" />

      <Image
        src={ILLUSTRATIONS.stars}
        alt=""
        width={120}
        height={120}
        className="pointer-events-none absolute right-8 top-8 opacity-[0.08]"
        aria-hidden="true"
      />
      <Image
        src={ILLUSTRATIONS.brushStrokeYellow}
        alt=""
        width={200}
        height={60}
        className="pointer-events-none absolute bottom-12 left-4 w-32 opacity-[0.04] sm:w-44"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">
            The next chapter starts with you
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Bring your curiosity.{" "}
            <span className="text-brand-yellow">We&apos;ll bring the community.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-muted">
            New to tech or already building? Join fellow students who want to
            learn, experiment, and create together.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/community"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
            >
              Join the Community
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
            >
              Explore the Community
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
