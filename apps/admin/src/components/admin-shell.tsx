"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  Images,
  Settings,
  Hexagon,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Images, label: "Gallery", href: "/gallery" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <nav className="flex flex-col h-full">
      <div className="flex h-14 items-center gap-2 border-b border-white/5 px-5">
        <Hexagon className="h-5 w-5 text-cyan-400" />
        <span className="text-sm font-bold tracking-tight">
          <span className="text-cyan-400">HH</span>{" "}
          <span className="text-gray-400">Admin</span>
        </span>
      </div>

      <div className="mt-3 flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-white/5 p-3">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-400">
              {session.email[0]?.toUpperCase()}
            </div>
            <span className="flex-1 truncate text-left text-xs">
              {session.email}
            </span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg border border-white/10 bg-[#0D1422] p-1 shadow-xl">
              <div className="px-3 py-1.5 text-xs text-gray-500">
                {session.role.replace("_", " ")}
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#080B12]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-white/5 bg-[#0D1422] lg:block">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 h-full w-64 bg-[#0D1422]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-white/5 px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-medium text-gray-300">
            {navItems.find((n) => isActive(n.href))?.label ?? "Dashboard"}
          </h2>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
