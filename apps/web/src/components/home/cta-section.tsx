"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { BRAND, TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-brand-bg-secondary py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${TEXTURES.cyanGradient})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-brand-bg-secondary/80" />

      <Image
        src={ILLUSTRATIONS.stars}
        alt=""
        width={120}
        height={120}
        className="pointer-events-none absolute right-8 top-8 opacity-10"
        aria-hidden="true"
      />
      <Image
        src={ILLUSTRATIONS.brushStrokeYellow}
        alt=""
        width={200}
        height={60}
        className="pointer-events-none absolute bottom-12 left-4 w-32 opacity-5 sm:w-44"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <Image
            src={BRAND.logoFull}
            alt=""
            width={80}
            height={80}
            className="mx-auto mb-6 h-20 w-20"
            aria-hidden="true"
          />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to build{" "}
            <span className="text-brand-cyan">something amazing?</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-muted">
            Whether you&apos;re a beginner picking up your first framework or a
            seasoned builder looking for collaborators — there&apos;s a place for
            you here.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/community"
              className="group inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-6 py-3.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
            >
              Join Hustlers Hive
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-border px-6 py-3.5 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/30 hover:text-brand-cyan"
            >
              Get in Touch
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
