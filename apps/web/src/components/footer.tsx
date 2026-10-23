import Link from "next/link";
import Image from "next/image";
import { BRAND, ICONS } from "@/lib/assets";
import { getSiteSettings } from "@/lib/supabase/queries";

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
  { label: "Open Source", href: "/projects" },
  { label: "Student Projects", href: "/projects" },
  { label: "Join Community", href: "/community" },
];

const principles = [
  { label: "Learn", icon: ICONS.features.workshop },
  { label: "Build", icon: ICONS.features.code },
  { label: "Collaborate", icon: ICONS.features.community },
  { label: "Grow", icon: ICONS.features.arrowUpRight },
];

const socialMeta: Record<string, { icon: string; label: string }> = {
  instagram: { icon: ICONS.social.instagram, label: "Instagram" },
  linkedin: { icon: ICONS.social.linkedin, label: "LinkedIn" },
  x: { icon: ICONS.social.x, label: "X (Twitter)" },
  github: { icon: ICONS.social.github, label: "GitHub" },
};

const CYAN_FILTER =
  "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)";

export async function Footer() {
  const settings = await getSiteSettings();
  const socials = settings.social_links ?? {};
  const whatsappUrl = settings.whatsapp_invite_url;

  return (
    <footer className="relative overflow-hidden border-t border-brand-border">
      {/* ── Background layers (Nashik parallax scene) ── */}
      {/* Layer 4 — Sky, clouds, moon & stars (furthest back) */}
      <Image
        src="/fotter/layer-4-sky-clouds-moon-stars.png"
        alt=""
        width={4076}
        height={416}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        aria-hidden="true"
        priority
      />
      {/* Layer 3 — Mountains, vineyards, Trimbakeshwar */}
      <Image
        src="/fotter/layer-3-mountains-vineyards-trimbakeshwar.png"
        alt=""
        width={4076}
        height={378}
        className="pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom"
        style={{ height: "70%" }}
        aria-hidden="true"
      />
      {/* Layer 2 — Panchvati ghats & Godavari river */}
      <Image
        src="/fotter/layer-2-panchvati-ghats-godavari.png"
        alt="Illustration of Panchvati ghats and Godavari river, Nashik"
        width={4076}
        height={436}
        className="pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom"
        style={{ height: "50%" }}
      />
      {/* Layer 1 — Foreground grapevines (closest) */}
      <Image
        src="/fotter/layer-1-foreground-grapevines.png"
        alt=""
        width={4076}
        height={312}
        className="pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom"
        style={{ height: "30%" }}
        aria-hidden="true"
      />
      {/* Dark overlay for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-brand-bg/70" />

      {/* ── Footer content (sits on top of layers) ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-0 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* A. Brand section */}
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
              collaboration and open source.
            </p>

            {/* Principles */}
            <div className="mt-5 flex flex-wrap gap-3">
              {principles.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-brand-bg/50 px-3 py-1 text-xs font-medium text-brand-muted backdrop-blur-sm"
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

            {/* Social icons */}
            <div className="mt-5 flex gap-2.5">
              {Object.entries(socialMeta).map(([key, meta]) => {
                const url = socials[key as keyof typeof socials];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-bg/40 backdrop-blur-sm transition-all hover:border-brand-cyan/40 hover:bg-brand-cyan/10"
                    aria-label={`Follow us on ${meta.label}`}
                  >
                    <Image
                      src={meta.icon}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100"
                      style={{ filter: CYAN_FILTER }}
                    />
                  </a>
                );
              })}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-brand-bg/40 backdrop-blur-sm transition-all hover:border-green-400/40 hover:bg-green-400/10"
                  aria-label="Join us on WhatsApp"
                >
                  <Image
                    src={ICONS.social.whatsapp}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100"
                    style={{ filter: "invert(65%) sepia(60%) saturate(500%) hue-rotate(90deg) brightness(110%)" }}
                  />
                </a>
              )}
            </div>
          </div>

          {/* B. Explore */}
          <div className="lg:col-span-2">
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
          </div>

          {/* C. Community */}
          <div className="lg:col-span-2">
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
                    className="text-sm text-brand-muted transition-colors hover:text-brand-text focus-visible:text-brand-text focus-visible:outline-none focus-visible:underline"
                  >
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
          </div>

          {/* D. Connect + E. CTA */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-cyan">
              Join Hustlers Hive
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-muted">
              Whether you&apos;re writing your first line of code or shipping your
              tenth project — there&apos;s a seat at the hive for you.
            </p>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-yellow/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg-secondary"
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
              </a>
            )}

            {/* Connect links */}
            {Object.keys(socials).length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-muted/60">
                  Connect
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(socialMeta).map(([key, meta]) => {
                    const url = socials[key as keyof typeof socials];
                    if (!url) return null;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-muted transition-colors hover:text-brand-cyan focus-visible:text-brand-cyan focus-visible:outline-none focus-visible:underline"
                        aria-label={`Follow us on ${meta.label}`}
                      >
                        {meta.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spacer so content doesn't overlap bottom layers too much */}
        <div className="h-32 sm:h-40 lg:h-48" />
      </div>

      {/* G. Bottom bar */}
      <div className="relative z-10 border-t border-white/10 bg-brand-bg/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-xs text-brand-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Hustlers Hive. All rights reserved.
          </p>
          <p className="text-center text-brand-muted/70">
            Built by students. For students. Run by students.
          </p>
          <p>
            Handcrafted with{" "}
            <span className="text-brand-error" aria-label="love">
              &#9829;
            </span>{" "}
            by{" "}
            <a
              href="https://nitinverse.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-cyan transition-colors hover:text-brand-cyan/80 focus-visible:outline-none focus-visible:underline"
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
