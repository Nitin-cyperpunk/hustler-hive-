"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@hustlers-hive/shared";
import { BRAND } from "@/lib/assets";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.06] bg-brand-bg/80 shadow-lg shadow-black/20 backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group relative flex items-center gap-2.5">
            <div className="relative">
              <Image
                src={BRAND.logoDark}
                alt="Hustlers Hive"
                width={40}
                height={40}
                className="h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute -inset-1 rounded-full bg-brand-cyan/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-brand-cyan">Hustlers</span>{" "}
              <span className="text-brand-yellow">Hive</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-3.5 py-2 text-sm font-medium transition-colors"
                >
                  <span
                    className={
                      active
                        ? "text-brand-text"
                        : "text-brand-muted group-hover:text-brand-text"
                    }
                  >
                    {link.label}
                  </span>
                  {/* Active indicator */}
                  <span
                    className={`absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full transition-all duration-300 ${
                      active
                        ? "bg-brand-cyan opacity-100"
                        : "bg-brand-cyan/50 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                  {/* Hover glow */}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-brand-cyan blur-[4px]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/community"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-brand-bg transition-all"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-cyan/80 transition-all duration-300 group-hover:from-brand-cyan group-hover:to-cyan-300" />
              <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: "0 0 20px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1)" }} />
              <span className="relative">Join Us</span>
              <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border/50 text-brand-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-text md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`absolute transition-all duration-300 ${
                mobileOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
              }`}
            >
              <X size={20} />
            </span>
            <span
              className={`absolute transition-all duration-300 ${
                mobileOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
              }`}
            >
              <Menu size={20} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-bg/60 backdrop-blur-sm"
            onClick={closeMobile}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm border-l border-brand-border/30 bg-brand-bg/95 backdrop-blur-2xl">
            {/* Close button */}
            <div className="flex h-16 items-center justify-end px-4 sm:h-[72px] sm:px-6">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border/50 text-brand-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-text"
                onClick={closeMobile}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-4 sm:px-6" aria-label="Mobile navigation">
              <div className="space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all ${
                        active
                          ? "bg-brand-cyan/10 text-brand-text"
                          : "text-brand-muted hover:bg-brand-surface/50 hover:text-brand-text"
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="flex items-center gap-3">
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                        )}
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className={`h-4 w-4 transition-all ${
                          active
                            ? "text-brand-cyan"
                            : "text-brand-muted/30 group-hover:text-brand-muted"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mt-6 border-t border-brand-border/30 pt-6">
                <Link
                  href="/community"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-cyan-400 px-5 py-3.5 text-[15px] font-semibold text-brand-bg transition-all hover:shadow-lg hover:shadow-brand-cyan/20"
                >
                  Join the Community
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Brand tag */}
              <p className="mt-8 text-center text-xs text-brand-muted/40">
                Built by students, for students.
              </p>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
