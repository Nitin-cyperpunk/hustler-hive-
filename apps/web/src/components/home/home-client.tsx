"use client";

import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { HeroSection } from "@/components/hero";
import { WhatWeDoSection } from "@/components/about";
import { NashikSection } from "@/components/home/nashik-section";
import { CTASection } from "@/components/home/cta-section";

export function HomeClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <HeroSection />
      <WhatWeDoSection />
      {children}
      <NashikSection />
      <CTASection />
    </SmoothScroll>
  );
}
