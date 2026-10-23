import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeClient } from "@/components/home/home-client";
import { EventsPreview } from "@/components/home/events-preview";
import { ProjectsPreview } from "@/components/home/projects-preview";
import { getFeaturedEvents, getFeaturedProjects } from "@/lib/supabase/queries";

export default async function HomePage() {
  const [events, projects] = await Promise.all([
    getFeaturedEvents(3),
    getFeaturedProjects(3),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
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
