import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeClient } from "@/components/home/home-client";
import { EventsPreview } from "@/components/home/events-preview";
import { ProjectsPreview } from "@/components/home/projects-preview";
import { getFeaturedEvents, getFeaturedProjects } from "@/lib/supabase/queries";
import { JsonLd } from "@/components/json-ld";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hustler-hive-ten.vercel.app";

export const metadata: Metadata = {
  title: "Hustlers Hive | Student Tech Community in Nashik",
  description:
    "Hustlers Hive is a student-driven technology community in Nashik, Maharashtra, bringing students together to learn, build projects, collaborate on open source, and attend tech events.",
  alternates: { canonical: SITE_URL },
};

async function getHomeData() {
  try {
    const [events, projects] = await Promise.all([
      getFeaturedEvents(3),
      getFeaturedProjects(3),
    ]);
    return { events, projects };
  } catch {
    return { events: [], projects: [] };
  }
}

export default async function HomePage() {
  const { events, projects } = await getHomeData();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hustlers Hive",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/logo-full.png`,
    description:
      "A student-driven technology community in Nashik, Maharashtra.",
    sameAs: [] as string[],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hustlers Hive",
    url: SITE_URL,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <Header />
      <main className="flex-1">
        <HomeClient>
          <EventsPreview events={events} />
          <ProjectsPreview projects={projects} />
        </HomeClient>
      </main>
      <Footer />
    </div>
  );
}
