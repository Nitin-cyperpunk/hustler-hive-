"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { BRAND, ICONS } from "@/lib/assets";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Projects", href: "/projects" },
  { label: "Community", href: "/community" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const communityLinks = [
  { label: "Upcoming Events", href: "/events" },
  { label: "Workshops", href: "/events" },
  { label: "Hackathons", href: "/events" },
  { label: "Student Projects", href: "/projects" },
  { label: "Open Source", href: "/projects" },
  { label: "Join Community", href: "/community" },
];

const chips = [
  { label: "Learn", icon: ICONS.features.workshop },
  { label: "Build", icon: ICONS.features.code },
  { label: "Collaborate", icon: ICONS.features.community },
  { label: "Grow", icon: ICONS.features.arrowUpRight },
];

const CYAN_FILTER =
  "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)";

interface FooterClientProps {
  whatsappUrl?: string;
  socials: Record<string, string>;
}

export function FooterClient({ whatsappUrl, socials }: FooterClientProps) {
  const footerRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !footerRef.current) return;

      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      const speeds = [0.08, 0.18, 0.32, 0.48];

      layers.forEach((layer, i) => {
        const travel = speeds[i] * 50;
        gsap.set(layer, { y: travel * 0.5 });
        gsap.to(layer, {
          y: -travel * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    },
    { scope: footerRef, dependencies: [reduced] },
  );

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: "#050810" }}
      role="contentinfo"
    >
      {/* ── Full-bleed landscape background (all 4 layers) ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Layer 4 — Sky */}
        <div
          ref={(el) => { layerRefs.current[0] = el; }}
          className="absolute inset-0 will-change-transform"
          style={{ zIndex: 1 }}
        >
          <img
            src="/fotter/layer-4-sky-clouds-moon-stars.png"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-center"
            style={{ opacity: 0.7 }}
          />
        </div>

        {/* Layer 3 — Mountains */}
        <div
          ref={(el) => { layerRefs.current[1] = el; }}
          className="absolute inset-x-0 bottom-0 will-change-transform"
          style={{ zIndex: 2, height: "70%" }}
        >
          <img
            src="/fotter/layer-3-mountains-vineyards-trimbakeshwar.png"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-bottom"
            style={{ opacity: 0.6 }}
          />
        </div>

        {/* Layer 2 — Ghats & Godavari */}
        <div
          ref={(el) => { layerRefs.current[2] = el; }}
          className="absolute inset-x-0 bottom-0 will-change-transform"
          style={{ zIndex: 3, height: "50%" }}
        >
          <img
            src="/fotter/layer-2-panchvati-ghats-godavari.png"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-bottom"
          />
        </div>

        {/* Layer 1 — Foreground foliage */}
        <div
          ref={(el) => { layerRefs.current[3] = el; }}
          className="absolute inset-x-0 bottom-0 will-change-transform"
          style={{ zIndex: 4, height: "25%" }}
        >
          <img
            src="/fotter/layer-1-foreground-grapevines.png"
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-bottom"
          />
        </div>

        {/* Ambient glows */}
        <div
          className="absolute inset-x-0"
          style={{
            zIndex: 5,
            top: "30%",
            height: "35%",
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(34,211,238,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            zIndex: 5,
            bottom: "10%",
            height: "25%",
            background:
              "radial-gradient(ellipse 50% 40% at 50% 60%, rgba(250,204,21,0.03) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Page-to-footer top blend ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          zIndex: 10,
          background: "linear-gradient(to bottom, var(--color-brand-bg), transparent)",
        }}
      />

      {/* ── Content overlay on top of landscape ── */}
      <div className="relative" style={{ zIndex: 20 }}>
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
          {/* Dark scrim behind text for readability */}
          <div
            className="absolute inset-0"
            style={{
              zIndex: -1,
              background:
                "linear-gradient(to bottom, rgba(5,8,16,0.92) 0%, rgba(5,8,16,0.75) 60%, rgba(5,8,16,0.3) 100%)",
            }}
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {/* Col 1 — Brand */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <Image
                  src={BRAND.logoFull}
                  alt="Hustlers Hive"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-brand-cyan">Hustlers</span>{" "}
                  <span className="text-brand-yellow">Hive</span>
                </span>
              </Link>
              <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-brand-muted">
                A student-driven technology community rooted in Nashik — building
                the next generation of technologists through collaboration, open
                source and real-world impact.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-brand-muted backdrop-blur-sm"
                  >
                    <Image
                      src={c.icon}
                      alt=""
                      width={10}
                      height={10}
                      className="h-2.5 w-2.5"
                      style={{ filter: CYAN_FILTER }}
                    />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Col 2 — Explore */}
            <nav className="lg:col-span-2" aria-label="Explore">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-brand-cyan">
                Explore
              </h3>
              <ul className="mt-3 space-y-2">
                {exploreLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-brand-muted transition-colors hover:text-brand-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Col 3 — Community */}
            <nav className="lg:col-span-2" aria-label="Community">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-brand-cyan">
                Community
              </h3>
              <ul className="mt-3 space-y-2">
                {whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] text-brand-muted transition-colors hover:text-brand-text"
                    >
                      <Image
                        src={ICONS.social.whatsapp}
                        alt=""
                        width={12}
                        height={12}
                        className="h-3 w-3 opacity-60"
                        style={{
                          filter:
                            "invert(65%) sepia(60%) saturate(500%) hue-rotate(90deg) brightness(110%)",
                        }}
                      />
                      Join on WhatsApp
                    </a>
                  </li>
                )}
                {communityLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-brand-muted transition-colors hover:text-brand-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Col 4 — Join CTA */}
            <div className="lg:col-span-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan/60">
                  Be part of the hive
                </p>
                <h3 className="mt-1.5 text-base font-bold text-brand-text">
                  Join Hustlers Hive
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">
                  Whether you&apos;re writing your first line of code or shipping
                  your tenth project — there&apos;s a seat at the hive for you.
                </p>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-brand-bg shadow-md shadow-brand-yellow/10 transition-all hover:shadow-lg hover:shadow-brand-yellow/20 hover:brightness-110"
                    aria-label="Join Hustlers Hive on WhatsApp"
                  >
                    <Image
                      src={ICONS.social.whatsapp}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    Join on WhatsApp
                    <span className="transition-transform group-hover:translate-x-0.5">
                      &#8594;
                    </span>
                  </a>
                )}

                {Object.keys(socials).length > 0 && (
                  <div className="mt-3 flex gap-1.5">
                    {Object.entries(socialMeta).map(([key, meta]) => {
                      const url = socials[key];
                      if (!url) return null;
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] transition-all hover:border-brand-cyan/30 hover:bg-brand-cyan/10"
                          aria-label={`Follow us on ${meta.label}`}
                        >
                          <Image
                            src={meta.icon}
                            alt=""
                            width={12}
                            height={12}
                            className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100"
                            style={{ filter: CYAN_FILTER }}
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="relative border-t border-white/[0.06]"
        style={{ zIndex: 20, backgroundColor: "rgba(4,6,12,0.85)", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-4 py-3 text-[11px] text-brand-muted/60 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Hustlers Hive. All rights reserved.</p>
          <p className="text-center">
            Built by students. For students. Run by students.
          </p>
          <p>
            Handcrafted with{" "}
            <span className="text-red-400" aria-label="love">&#9829;</span>{" "}
            by{" "}
            <a
              href="https://nitinverse.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-cyan/70 transition-colors hover:text-brand-cyan"
              aria-label="Nitinverse — opens in a new tab"
            >
              Nitinverse &#8599;
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

const socialMeta: Record<string, { icon: string; label: string }> = {
  instagram: { icon: ICONS.social.instagram, label: "Instagram" },
  linkedin: { icon: ICONS.social.linkedin, label: "LinkedIn" },
  x: { icon: ICONS.social.x, label: "X (Twitter)" },
  github: { icon: ICONS.social.github, label: "GitHub" },
};
