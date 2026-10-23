"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { BRAND, ICONS } from "@/lib/assets";

const PARALLAX_LAYERS = [
  { src: "/fotter/layer-4-sky-clouds-moon-stars.png", alt: "", speed: 0.1 },
  {
    src: "/fotter/layer-3-mountains-vineyards-trimbakeshwar.png",
    alt: "",
    speed: 0.22,
  },
  {
    src: "/fotter/layer-2-panchvati-ghats-godavari.png",
    alt: "Illustration of Panchvati ghats and Godavari river, Nashik",
    speed: 0.38,
  },
  {
    src: "/fotter/layer-1-foreground-grapevines.png",
    alt: "",
    speed: 0.55,
  },
] as const;

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
];

const principles = [
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !sceneRef.current) return;

      const layers = layerRefs.current.filter(Boolean) as HTMLDivElement[];
      const triggers: ScrollTrigger[] = [];

      layers.forEach((layer, i) => {
        const speed = PARALLAX_LAYERS[i].speed;
        const distance = speed * 120;

        gsap.set(layer, { y: distance * 0.5 });

        const tween = gsap.to(layer, {
          y: -distance * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: sceneRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      });

      return () => {
        triggers.forEach((st) => st.kill());
      };
    },
    { scope: footerRef, dependencies: [reduced] },
  );

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-[#060911]"
      role="contentinfo"
    >
      {/* ── Top gradient: page → footer blend ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-brand-bg) 0%, transparent 100%)",
        }}
      />

      {/* ── Main footer content ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Column 1 — Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src={BRAND.logoFull}
                alt="Hustlers Hive"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-brand-cyan">Hustlers</span>{" "}
                <span className="text-brand-yellow">Hive</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-muted">
              A student-driven technology community rooted in Nashik, Maharashtra
              — building the next generation of student technologists through
              collaboration, open source and real-world impact.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {principles.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-brand-muted backdrop-blur-sm"
                >
                  <Image
                    src={p.icon}
                    alt=""
                    width={12}
                    height={12}
                    className="h-3 w-3"
                    style={{ filter: CYAN_FILTER }}
                  />
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2 — Explore */}
          <nav className="lg:col-span-2" aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-muted transition-colors hover:text-brand-text focus-visible:text-brand-text focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Community */}
          <nav className="lg:col-span-2" aria-label="Community">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan">
              Community
            </h3>
            <ul className="mt-4 space-y-2.5">
              {whatsappUrl && (
                <li>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-text"
                  >
                    <Image
                      src={ICONS.social.whatsapp}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 opacity-60"
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
                    className="text-sm text-brand-muted transition-colors hover:text-brand-text focus-visible:text-brand-text focus-visible:outline-none focus-visible:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4 — Join CTA */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-cyan/70">
                Be part of the hive
              </p>
              <h3 className="mt-2 text-lg font-bold text-brand-text">
                Join Hustlers Hive
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                Whether you&apos;re writing your first line of code or shipping
                your tenth project — there&apos;s a seat at the hive for you.
              </p>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-bg shadow-lg shadow-brand-yellow/10 transition-all hover:shadow-xl hover:shadow-brand-yellow/20 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#060911]"
                  aria-label="Join Hustlers Hive on WhatsApp"
                >
                  <Image
                    src={ICONS.social.whatsapp}
                    alt=""
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5"
                  />
                  Join on WhatsApp
                  <span className="transition-transform group-hover:translate-x-0.5">
                    &#8594;
                  </span>
                </a>
              )}

              {/* Social row */}
              {Object.keys(socials).length > 0 && (
                <div className="mt-5 flex gap-2">
                  {Object.entries(socialMeta).map(([key, meta]) => {
                    const url = socials[key];
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-all hover:border-brand-cyan/30 hover:bg-brand-cyan/10"
                        aria-label={`Follow us on ${meta.label}`}
                      >
                        <Image
                          src={meta.icon}
                          alt=""
                          width={14}
                          height={14}
                          className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-100"
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

      {/* ── Parallax landscape scene ── */}
      <div
        ref={sceneRef}
        className="relative z-[2] h-[240px] w-full overflow-hidden sm:h-[300px] md:h-[360px] lg:h-[420px]"
        aria-hidden="true"
      >
        {/* Top fade: blend content into scene */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
          style={{
            background:
              "linear-gradient(to bottom, #060911 0%, transparent 100%)",
          }}
        />

        {/* Cyan ambient glow behind mountains */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[30%] z-[1] h-[40%]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Golden warm glow near riverfront */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[20%] z-[3] h-[30%]"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 70%, rgba(250,204,21,0.04) 0%, transparent 70%)",
          }}
        />

        {PARALLAX_LAYERS.map((layer, i) => (
          <div
            key={layer.src}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-x-0 bottom-0 will-change-transform"
            style={{ zIndex: i + 1 }}
          >
            <img
              src={layer.src}
              alt={layer.alt}
              loading="lazy"
              className="block h-auto w-full object-cover object-bottom"
              style={{
                minHeight: i === 0 ? "100%" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 border-t border-white/[0.06] bg-[#040710]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 text-[11px] text-brand-muted/70 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Hustlers Hive. All rights reserved.</p>
          <p className="text-center">
            Built by students. For students. Run by students.
          </p>
          <p>
            Handcrafted with{" "}
            <span className="text-red-400" aria-label="love">
              &#9829;
            </span>{" "}
            by{" "}
            <a
              href="https://nitinverse.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-cyan/80 transition-colors hover:text-brand-cyan focus-visible:outline-none focus-visible:underline"
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
