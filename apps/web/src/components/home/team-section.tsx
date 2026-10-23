"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Coffee } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ILLUSTRATIONS } from "@/lib/assets";

export function TeamSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <Image
        src={ILLUSTRATIONS.stars}
        alt=""
        width={100}
        height={100}
        className="pointer-events-none absolute right-6 top-14 opacity-[0.05]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">
              The People Behind the Hive
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Meet the{" "}
              <span className="text-brand-yellow">Core Team</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="mt-4 text-lg leading-relaxed text-brand-muted">
              Every community has people behind the ideas, conversations, and
              things worth building. Meet the students who help shape Hustlers
              Hive.
            </p>
          </ScrollReveal>
        </div>

        {/* Break announcement card */}
        <ScrollReveal delay={0.2}>
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="rounded-2xl border border-brand-border bg-brand-surface/40 p-8 sm:p-10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 inline-flex rounded-xl bg-brand-yellow/10 p-3">
                  <Coffee className="h-6 w-6 text-brand-yellow" />
                </div>

                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-yellow/20 bg-brand-yellow/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-yellow">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow animate-pulse" />
                  On a Little Break
                </span>

                <h3 className="text-xl font-semibold sm:text-2xl">
                  The Hive team is recharging.
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-muted sm:text-base">
                  Our core team is taking an indefinite break while figuring out
                  what&apos;s next. We don&apos;t have a confirmed return date
                  yet, but the spirit of learning, building, and collaborating
                  remains at the heart of Hustlers Hive.
                </p>

                <p className="mt-4 text-xs text-brand-muted/70">
                  No comeback date announced. We&apos;ll share updates when plans
                  are confirmed.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Empty state for team profiles */}
        <ScrollReveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-md text-center text-sm text-brand-muted/60">
            Core team profiles will appear here when they&apos;re ready to be
            shared.
          </p>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.35}>
          <div className="mt-8 text-center">
            <Link
              href="/community"
              className="group inline-flex items-center gap-2 rounded-lg border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/40 hover:text-brand-cyan"
            >
              Follow the Community
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
