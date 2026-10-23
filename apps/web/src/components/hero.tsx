"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ILLUSTRATIONS } from "@/lib/assets";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* ── Background scene ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Layer 4 — Night sky */}
        <img
          src="/fotter/layer-4-sky-clouds-moon-stars.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        {/* Layer 3 — Mountains */}
        <img
          src="/fotter/layer-3-mountains-vineyards-trimbakeshwar.png"
          alt=""
          className="absolute bottom-0 left-0 w-full object-cover object-bottom opacity-50"
          style={{ height: "60%" }}
        />
        {/* Layer 2 — Ghats & Godavari */}
        <img
          src="/fotter/layer-2-panchvati-ghats-godavari.png"
          alt=""
          className="absolute bottom-0 left-0 w-full object-cover object-bottom opacity-40"
          style={{ height: "45%" }}
        />

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-brand-bg/90 via-brand-bg/70 to-brand-bg/30 lg:via-brand-bg/50 lg:to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-brand-bg/60 via-transparent to-brand-bg/80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-brand-bg to-transparent" />
      </div>

      {/* Decorative accents */}
      <Image
        src={ILLUSTRATIONS.circuitCorner}
        alt=""
        width={200}
        height={200}
        className="pointer-events-none absolute right-0 top-0 w-36 opacity-[0.07] sm:w-48"
        aria-hidden="true"
      />

      {/* Cyan ambient glow */}
      <div
        className="pointer-events-none absolute right-[15%] top-[40%] h-[400px] w-[600px] -translate-y-1/2"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse, rgba(34,211,238,0.08) 0%, transparent 70%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8" style={{ minHeight: "calc(100vh - 64px)" }}>
        <div className="w-full py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p
              className="hero-fade text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-cyan/80 sm:text-xs"
              style={{ animation: "heroFadeUp 0.6s ease-out 0.1s both" }}
            >
              Students &middot; Technology &middot; Community &middot; Nashik
            </p>

            {/* Headline */}
            <h1
              className="hero-fade mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animation: "heroFadeUp 0.6s ease-out 0.2s both" }}
            >
              Ideas Meet{" "}
              <span className="text-brand-yellow">Impact</span>
            </h1>

            {/* Description */}
            <p
              className="hero-fade mt-5 max-w-lg text-base leading-relaxed text-brand-muted sm:mt-6 sm:text-lg"
              style={{ animation: "heroFadeUp 0.6s ease-out 0.35s both" }}
            >
              A student-driven technology community from Nashik, building the
              next generation of student technologists through collaboration,
              open source and real-world impact.
            </p>

            {/* CTAs */}
            <div
              className="hero-fade mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4"
              style={{ animation: "heroFadeUp 0.6s ease-out 0.5s both" }}
            >
              <Link
                href="/community"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-brand-cyan px-6 py-3 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/25"
              >
                Join the Community
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-border px-6 py-3 text-sm font-semibold text-brand-text transition-colors hover:border-brand-cyan/40 hover:text-brand-cyan"
              >
                Explore Events
              </Link>
            </div>

            {/* Stats / trust signals */}
            <div
              className="hero-fade mt-10 flex flex-wrap gap-6 sm:mt-12 sm:gap-8"
              style={{ animation: "heroFadeUp 0.6s ease-out 0.65s both" }}
            >
              <div>
                <p className="text-2xl font-bold text-brand-text sm:text-3xl">Open</p>
                <p className="mt-0.5 text-xs text-brand-muted">Source Projects</p>
              </div>
              <div className="h-10 w-px bg-brand-border" />
              <div>
                <p className="text-2xl font-bold text-brand-text sm:text-3xl">Free</p>
                <p className="mt-0.5 text-xs text-brand-muted">Events & Workshops</p>
              </div>
              <div className="h-10 w-px bg-brand-border" />
              <div>
                <p className="text-2xl font-bold text-brand-cyan sm:text-3xl">Nashik</p>
                <p className="mt-0.5 text-xs text-brand-muted">Rooted Community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <Image
        src={ILLUSTRATIONS.godavariWaves}
        alt=""
        width={1200}
        height={120}
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.07]"
        aria-hidden="true"
      />
    </section>
  );
}
