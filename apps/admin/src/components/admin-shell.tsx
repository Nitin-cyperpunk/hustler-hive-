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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { AdminSession } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Images, label: "Gallery", href: "/gallery" },
  { icon: Settings, label: "Settings", href: "/settings", minRole: "admin" as const },
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
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const roleHierarchy = { editor: 0, admin: 1, super_admin: 2 } as const;
  const userLevel = roleHierarchy[session.role as keyof typeof roleHierarchy] ?? 0;

  const visibleItems = navItems.filter((item) => {
    if (!item.minRole) return true;
    return userLevel >= (roleHierarchy[item.minRole as keyof typeof roleHierarchy] ?? 0);
  });

  const pageTitle = visibleItems.find((n) => isActive(n.href))?.label ?? "Dashboard";

  const sidebarNav = (
    <div className="flex flex-col h-full">
      <div className={cn("flex h-14 items-center gap-2 border-b border-brand-border px-4", collapsed && "justify-center px-2")}>
        <Hexagon className="h-5 w-5 text-brand-cyan shrink-0" />
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight">
            <span className="text-brand-cyan">HH</span>{" "}
            <span className="text-brand-muted">Admin</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex-1 space-y-1 px-2">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-cyan/10 text-brand-cyan"
                  : "text-brand-muted hover:bg-brand-surface hover:text-brand-text",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }
          return linkContent;
        })}
      </div>

      <Separator />
      <div className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-muted transition-colors hover:bg-brand-surface hover:text-brand-text",
                collapsed && "justify-center px-2"
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cyan/10 text-xs font-bold text-brand-cyan shrink-0">
                {session.email[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <span className="flex-1 truncate text-left text-xs">{session.email}</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={collapsed ? "right" : "top"} align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-brand-text truncate">{session.email}</p>
                <p className="text-xs text-brand-muted capitalize">{session.role.replace("_", " ")}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut} className="w-full">
                <button type="submit" className="flex w-full items-center gap-2 text-brand-error">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen bg-brand-bg">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden shrink-0 border-r border-brand-border bg-brand-bg-secondary transition-all duration-200 lg:block",
            collapsed ? "w-14" : "w-56"
          )}
        >
          {sidebarNav}
        </aside>

        {/* Mobile sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 bg-brand-bg-secondary p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {sidebarNav}
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center gap-3 border-b border-brand-border bg-brand-bg-secondary/50 px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              <span className="sr-only">{collapsed ? "Expand" : "Collapse"} sidebar</span>
            </Button>
            <h1 className="text-sm font-semibold text-brand-text">{pageTitle}</h1>
          </header>

          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
