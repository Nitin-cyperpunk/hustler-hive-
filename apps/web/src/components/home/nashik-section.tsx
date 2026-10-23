"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ImageReveal } from "@/components/motion/image-reveal";
import { Parallax } from "@/components/motion/parallax";
import { NASHIK, TEXTURES, ILLUSTRATIONS } from "@/lib/assets";

export function NashikSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <Parallax speed={0.1} className="absolute inset-0">
        <div
          className="h-full w-full opacity-10"
          style={{
            backgroundImage: `url(${TEXTURES.subtleGrid})`,
            backgroundSize: "cover",
          }}
        />
      </Parallax>
      <Image
        src={ILLUSTRATIONS.nashikHills}
        alt=""
        width={1000}
        height={360}
        className="pointer-events-none absolute bottom-0 left-0 w-full opacity-5"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <ScrollReveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-yellow">
                Our Roots
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Proudly from{" "}
                <span className="text-brand-cyan">Nashik</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mt-4 leading-relaxed text-brand-muted">
                Nestled along the banks of the Godavari, Nashik is more than a city of
                temples and vineyards — it&apos;s home to a growing wave of student
                technologists. Hustlers Hive channels that energy into a community
                where learning meets building.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="mt-4 leading-relaxed text-brand-muted">
                From college labs to weekend hackathons, we&apos;re putting Nashik
                on the tech map — one event, one project, one student at a time.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.35}>
              <Image
                src={ILLUSTRATIONS.templeLineArt}
                alt=""
                width={80}
                height={80}
                className="mt-6 opacity-20"
                aria-hidden="true"
              />
            </ScrollReveal>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImageReveal direction="left" className="overflow-hidden rounded-xl">
              <Image
                src={NASHIK.godavariGhats}
                alt="AI-generated cinematic interpretation of Godavari ghats, Nashik"
                width={600}
                height={400}
                className="h-64 w-full object-cover sm:h-72"
              />
            </ImageReveal>
            <ImageReveal direction="right" className="overflow-hidden rounded-xl sm:mt-8">
              <Image
                src={NASHIK.kalaramTemple}
                alt="AI-generated cinematic interpretation of Kalaram Temple, Nashik"
                width={600}
                height={400}
                className="h-64 w-full object-cover sm:h-72"
              />
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
