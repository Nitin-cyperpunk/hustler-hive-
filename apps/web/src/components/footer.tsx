import { COMMUNITY } from "@hustlers-hive/shared";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {COMMUNITY.name}. {COMMUNITY.location}.
          </p>
          <p className="text-sm text-gray-600">
            Made with passion by students.
          </p>
        </div>
      </div>
    </footer>
  );
}
