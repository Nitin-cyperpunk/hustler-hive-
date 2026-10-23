import Link from "next/link";
import { ArrowRight, Github, ExternalLink, FolderGit2 } from "lucide-react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { StaggerChildren } from "@/components/motion/stagger-children";
import type { Database } from "@hustlers-hive/shared";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function ProjectsPreview({ projects }: { projects: Project[] }) {
  return (
    <section className="bg-brand-bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <ScrollReveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-cyan">
                Projects
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built by the community
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.15}>
            <Link
              href="/projects"
              className="group hidden items-center gap-1 text-sm font-medium text-brand-cyan sm:inline-flex"
            >
              View all projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </ScrollReveal>
        </div>

        {projects.length === 0 ? (
          <ScrollReveal delay={0.2}>
            <div className="mt-12 rounded-xl border border-dashed border-brand-border p-12 text-center">
              <FolderGit2 className="mx-auto h-10 w-10 text-brand-muted/40" />
              <p className="mt-3 text-brand-muted">
                Projects coming soon. Stay tuned!
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerChildren className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-brand-border bg-brand-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-cyan/30 hover:shadow-lg hover:shadow-brand-cyan/5"
              >
                <h3 className="text-lg font-semibold">{project.title}</h3>
                {project.summary && (
                  <p className="mt-2 line-clamp-2 text-sm text-brand-muted">
                    {project.summary}
                  </p>
                )}
                {project.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-brand-cyan/10 px-2.5 py-0.5 text-xs font-medium text-brand-cyan"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-cyan"
                    >
                      <Github className="h-3.5 w-3.5" /> Source
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-cyan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </StaggerChildren>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan"
          >
            View all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
