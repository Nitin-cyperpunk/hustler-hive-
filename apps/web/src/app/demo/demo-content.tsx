"use client";

import Image from "next/image";
import { ArrowRight, Code, Calendar, Users } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { NASHIK, TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

export function DemoContent() {
  const reduced = useReducedMotion();

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[var(--hh-bg)] text-[var(--hh-text)]">
        {/* Typography Section */}
        <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${TEXTURES.darkGrain})`,
              backgroundSize: "cover",
            }}
          />
          <div className="relative mx-auto max-w-4xl">
            <ScrollReveal>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--hh-cyan)]">
                Design System Demo
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Built by students.{" "}
                <span className="text-[var(--hh-cyan)]">For students.</span>{" "}
                Run by students.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-6 max-w-2xl text-lg text-[var(--hh-muted)]">
                Hustlers Hive is a technology community rooted in Nashik — organizing meetups, hackathons, workshops, and open-source collaborations.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Button Interactions */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <h2 className="mb-8 text-2xl font-bold">Buttons & Interactions</h2>
            </ScrollReveal>
            <div className="flex flex-wrap gap-4">
              <button className="group inline-flex items-center gap-2 rounded-lg bg-[var(--hh-cyan)] px-6 py-3 text-sm font-semibold text-[var(--hh-bg)] transition-all hover:shadow-lg hover:shadow-[var(--hh-cyan)]/20">
                Primary Action
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--hh-cyan)]/40 px-6 py-3 text-sm font-semibold text-[var(--hh-cyan)] transition-all hover:bg-[var(--hh-cyan)]/10">
                Secondary
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-[var(--hh-yellow)] px-6 py-3 text-sm font-semibold text-[var(--hh-bg)] transition-all hover:shadow-lg hover:shadow-[var(--hh-yellow)]/20">
                Accent Action
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm text-[var(--hh-muted)] transition-colors hover:text-[var(--hh-text)]">
                Ghost
              </button>
            </div>
          </div>
        </section>

        {/* Card Hover States */}
        <section className="bg-[var(--hh-bg-secondary)] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <h2 className="mb-8 text-2xl font-bold">Card Hover States</h2>
            </ScrollReveal>
            <StaggerChildren className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Code, title: "Open Source", desc: "Contributing to projects that matter" },
                { icon: Calendar, title: "Events", desc: "Regular meetups and hackathons in Nashik" },
                { icon: Users, title: "Community", desc: "A network of student builders and makers" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-xl border border-[var(--hh-border)] bg-[var(--hh-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--hh-cyan)]/30 hover:shadow-lg hover:shadow-[var(--hh-cyan)]/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-[var(--hh-cyan)]/10 p-2.5">
                    <item.icon className="h-5 w-5 text-[var(--hh-cyan)]" />
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm text-[var(--hh-muted)]">{item.desc}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Image Reveal */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <h2 className="mb-8 text-2xl font-bold">Image Clipping Reveal</h2>
            </ScrollReveal>
            <div className="grid gap-8 sm:grid-cols-2">
              <ImageReveal direction="left" className="overflow-hidden rounded-xl">
                <Image
                  src={NASHIK.godavariGhats}
                  alt="AI-generated cinematic interpretation of Godavari ghats"
                  width={600}
                  height={400}
                  className="h-64 w-full object-cover"
                />
              </ImageReveal>
              <ImageReveal direction="right" className="overflow-hidden rounded-xl">
                <Image
                  src={NASHIK.kalaramTemple}
                  alt="AI-generated cinematic interpretation of Kalaram Temple"
                  width={600}
                  height={400}
                  className="h-64 w-full object-cover"
                />
              </ImageReveal>
            </div>
          </div>
        </section>

        {/* Parallax + SVG Decoration */}
        <section className="relative overflow-hidden bg-[var(--hh-bg-secondary)] px-4 py-24 sm:px-6 lg:px-8">
          <Parallax speed={0.15} className="absolute inset-0">
            <div
              className="h-full w-full opacity-10"
              style={{
                backgroundImage: `url(${TEXTURES.subtleGrid})`,
                backgroundSize: "cover",
              }}
            />
          </Parallax>
          <div className="relative mx-auto max-w-4xl text-center">
            <ScrollReveal>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Parallax & Texture Overlay
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="mx-auto mt-4 max-w-lg text-[var(--hh-muted)]">
                Subtle parallax on the grid texture background with scroll-triggered text reveals.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="mt-8 flex justify-center">
                <Image
                  src={ILLUSTRATIONS.templeLineArt}
                  alt=""
                  width={120}
                  height={120}
                  className="opacity-30"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Reduced Motion Notice */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <ScrollReveal>
              <div className="rounded-xl border border-[var(--hh-border)] bg-[var(--hh-surface)] p-6">
                <h2 className="mb-2 font-semibold">Reduced Motion</h2>
                <p className="text-sm text-[var(--hh-muted)]">
                  {reduced
                    ? "✓ Reduced motion is active. Animations are disabled and all content is immediately visible."
                    : "Animations are active. Enable \"prefers-reduced-motion: reduce\" in your OS accessibility settings to test reduced motion behavior."}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <footer className="border-t border-[var(--hh-border)] px-4 py-8 text-center text-sm text-[var(--hh-muted)]">
          Design System Demo — Internal Development Route
        </footer>
      </div>
    </SmoothScroll>
  );
}
