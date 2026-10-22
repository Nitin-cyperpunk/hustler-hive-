import { Button } from "@hustlers-hive/ui";
import { Construction } from "lucide-react";

export function DashboardPlaceholder() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Construction className="h-8 w-8 text-yellow-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          This dashboard is under construction. Authentication, content
          management, and event administration will be available in upcoming
          phases.
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next up — Phase 1
            </p>
            <ul className="mt-2 space-y-1 text-left text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                Supabase authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                Database schema &amp; migrations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                Role-based access control
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                Event management
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              View public site
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
