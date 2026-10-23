"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { NASHIK, ILLUSTRATIONS } from "@/lib/assets";

export function CommunityStatus() {
  return (
    <section className="relative overflow-hidden bg-brand-bg-secondary py-20 sm:py-28">
      <Image
        src={ILLUSTRATIONS.brushStrokeYellow}
        alt=""
        width={200}
        height={60}
        className="pointer-events-none absolute right-4 top-16 w-28 opacity-5 sm:w-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <ScrollReveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-yellow">
                A little pause. A bigger plan.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                The Hive is{" "}
                <span className="text-brand-cyan">recharging.</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-5 max-w-lg leading-relaxed text-brand-muted">
                Our team is taking a short creative break to plan better meetups,
                build stronger collaborations, and bring more hands-on
                opportunities to Nashik&apos;s student tech community.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.25}>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                Planning Mode
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="mt-8 space-y-3">
                {[
                  "Better community experiences",
                  "New learning opportunities",
                  "More opportunities to build together",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10">
                      <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                    </div>
                    <span className="text-sm text-brand-muted">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.15} direction="right">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={NASHIK.godavariGhats}
                alt="AI-generated cinematic interpretation of Godavari ghats, Nashik"
                width={600}
                height={400}
                className="h-72 w-full object-cover sm:h-80 lg:h-96"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-bg-secondary/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <Image
                  src={ILLUSTRATIONS.templeLineArt}
                  alt=""
                  width={60}
                  height={60}
                  className="opacity-30"
                  aria-hidden="true"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
