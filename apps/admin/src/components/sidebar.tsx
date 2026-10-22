import { LayoutDashboard, Calendar, Users, Settings, Hexagon } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", active: true },
  { icon: Calendar, label: "Events", href: "/events", active: false },
  { icon: Users, label: "Members", href: "/members", active: false },
  { icon: Settings, label: "Settings", href: "/settings", active: false },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-gray-950 lg:block">
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-6">
        <Hexagon className="h-6 w-6 text-cyan-400" />
        <span className="text-sm font-bold tracking-tight">
          <span className="text-cyan-400">HH</span>{" "}
          <span className="text-gray-400">Admin</span>
        </span>
      </div>

      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              item.active
                ? "bg-white/5 text-white"
                : "text-gray-500 hover:bg-white/[0.02] hover:text-gray-300"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
}
