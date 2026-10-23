import type { Metadata } from "next";
import Image from "next/image";
import { Github, ExternalLink, FolderGit2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getPublishedProjects } from "@/lib/supabase/queries";
import { ICONS, TEXTURES } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore open-source projects built by the Hustlers Hive community.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative py-16 sm:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{ backgroundImage: `url(${TEXTURES.darkGrain})`, backgroundSize: "cover" }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Image
                src={ICONS.features.projects}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
                style={{ filter: "invert(78%) sepia(47%) saturate(1000%) hue-rotate(150deg) brightness(100%)" }}
              />
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
                Projects
              </p>
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Open-source &amp; community builds
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-brand-muted">
              Real projects, built by students. Contribute, fork, or get inspired.
            </p>

            {projects.length === 0 ? (
              <div className="mt-16 rounded-xl border border-dashed border-brand-border p-16 text-center">
                <FolderGit2 className="mx-auto h-12 w-12 text-brand-muted/40" />
                <p className="mt-4 text-lg text-brand-muted">
                  Projects coming soon. We&apos;re building something!
                </p>
              </div>
            ) : (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5"
                  >
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                    {project.summary && (
                      <p className="mt-2 line-clamp-3 text-sm text-brand-muted">
                        {project.summary}
                      </p>
                    )}
                    {project.description && !project.summary && (
                      <p className="mt-2 line-clamp-3 text-sm text-brand-muted">
                        {project.description}
                      </p>
                    )}
                    {project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full bg-brand-cyan/10 px-2.5 py-0.5 text-xs font-medium text-brand-cyan"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex gap-4">
                      {project.repository_url && (
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-cyan"
                        >
                          <Github className="h-4 w-4" /> Source
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-cyan"
                        >
                          <ExternalLink className="h-4 w-4" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
