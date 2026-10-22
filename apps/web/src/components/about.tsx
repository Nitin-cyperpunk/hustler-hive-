import { Code, Users, Calendar } from "lucide-react";

const highlights = [
  {
    icon: Calendar,
    title: "Meetups & Hackathons",
    description:
      "Regular tech events where students learn, build, and compete together.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "A welcoming space for students of every skill level — from beginners to builders.",
  },
  {
    icon: Code,
    title: "Open Source",
    description:
      "Everything we build is open source. Contribute, learn, and grow with us.",
  },
];

export function About() {
  return (
    <section className="border-t border-white/5 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What we <span className="text-yellow-400">do</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-400">
          We bring students together through technology — building skills,
          projects, and friendships that last beyond college.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-colors hover:border-cyan-500/20 hover:bg-white/[0.04]"
            >
              <item.icon className="mb-4 h-8 w-8 text-cyan-400" />
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
