import type { CommunityInfo, NavLink } from "./types";

export const COMMUNITY: CommunityInfo = {
  name: "Hustlers Hive",
  tagline: "Built by students. For students. Run by students.",
  description:
    "A student-driven technology community based in Nashik, Maharashtra — organizing tech meetups, hackathons, workshops, casual hangouts, and open-source collaborations.",
  location: "Nashik, Maharashtra",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Projects", href: "/projects" },
  { label: "Community", href: "/community" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];
