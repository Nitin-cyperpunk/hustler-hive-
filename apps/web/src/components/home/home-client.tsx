"use client";

import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { HeroSection } from "@/components/hero";
import { CommunityStatus } from "@/components/home/community-status";
import { HackathonSection } from "@/components/home/hackathon-section";
import { CommunitySection } from "@/components/home/community-section";
import { CTASection } from "@/components/home/cta-section";

export function HomeClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      {/* 1. Hero */}
      <HeroSection />
      {/* 2. Community Status — "The Hive is recharging" */}
      <CommunityStatus />
      {/* 3. Events + 4. Projects (passed as children from server component) */}
      {children}
      {/* 5. Hackathons — "In planning phase" */}
      <HackathonSection />
      {/* 6. Community — "Find your people" */}
      <CommunitySection />
      {/* 7. Final CTA */}
      <CTASection />
    </SmoothScroll>
  );
}
