"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { ICONS, ILLUSTRATIONS } from "@/lib/assets";

const highlights = [
  {
    icon: ICONS.features.events,
    title: "Meetups & Hackathons",
    description: "Regular tech events where students learn, build, and compete together.",
  },
  {
    icon: ICONS.features.community,
    title: "Community First",
    description: "A welcoming space for students of every skill level — beginners to builders.",
  },
  {
    icon: ICONS.features.code,
    title: "Open Source",
    description: "Everything we build is open source. Contribute, learn, and grow with us.",
  },
  {
    icon: ICONS.features.projects,
    title: "Project Showcases",
    description: "Ship real projects, get feedback, and build your portfolio while in college.",
  },
  {
    icon: ICONS.features.workshop,
    title: "Workshops",
    description: "Hands-on sessions covering web dev, AI/ML, DevOps, and emerging tech.",
  },
  {
    icon: ICONS.features.location,
    title: "Nashik Roots",
    description: "Proudly local, globally minded — representing Nashik's student tech scene.",
  },
];

export function WhatWeDoSection() {
  return (
    <section className="relative bg-brand-bg-secondary py-20 sm:py-28">
      <Image
        src={ILLUSTRATIONS.brushStrokeYellow}
        alt=""
        width={200}
        height={60}
        className="pointer-events-none absolute left-4 top-12 w-32 opacity-5 sm:w-48"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brand-cyan">
            What we do
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Building skills, projects &amp;{" "}
            <span className="relative inline-block text-brand-yellow">
              friendships
              <Image
                src={ILLUSTRATIONS.underlineCyan}
                alt=""
                width={160}
                height={20}
                className="pointer-events-none absolute -bottom-2 left-0 w-full opacity-40"
                aria-hidden="true"
              />
            </span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="mx-auto mt-4 max-w-2xl text-center text-brand-muted">
            We bring students together through technology — creating experiences
            that last beyond college.
          </p>
        </ScrollReveal>

        <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5"
            >
              <div className="mb-4 inline-flex rounded-lg bg-brand-cyan/10 p-2.5">
                <Image
                  src={item.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 text-brand-cyan"
                  style={{ filter: "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)" }}
                />
              </div>
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">
                {item.description}
              </p>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
