import { Button } from "@hustlers-hive/ui";
import { COMMUNITY } from "@hustlers-hive/shared";
import { ArrowRight } from "lucide-react";

const JOIN_URL = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL || "#";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-400">
            {COMMUNITY.location}
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {COMMUNITY.tagline.split(". ").map((part, i) => (
              <span key={i} className="block">
                {part}
                {i < 2 ? "." : ""}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-lg text-gray-400 sm:text-xl">
            {COMMUNITY.description}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href={JOIN_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                Join the Community
                <ArrowRight size={18} />
              </Button>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
