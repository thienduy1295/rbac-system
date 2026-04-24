"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  FolderKey,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";

interface AppSidebarProps {
  userName: string;
  userRole: string;
  canSeeGroups: boolean;
  canSeeUsers: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({
  userName,
  userRole,
  canSeeGroups,
  canSeeUsers,
  collapsed,
  onToggle,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { dict } = useLocale();

  const mainNav = [
    {
      label: dict.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: dict.nav.departments,
      href: "/departments",
      icon: Building2,
      exact: false,
    },
  ];

  const settingsNav = [
    {
      label: dict.settings.tabs.permissions,
      href: "/settings/permissions",
      icon: ShieldCheck,
      show: true,
    },
    {
      label: dict.settings.tabs.groups,
      href: "/settings/groups",
      icon: FolderKey,
      show: canSeeGroups,
    },
    {
      label: dict.settings.tabs.users,
      href: "/settings/users",
      icon: Users,
      show: canSeeUsers,
    },
  ].filter((t) => t.show);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/* Logo + Toggle */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "flex-col justify-center gap-0.5 py-1.5" : "px-4",
        )}
      >
        <Link
          href="/dashboard"
          title={collapsed ? "RBAC System" : undefined}
          className={cn(
            "flex items-center gap-2.5",
            collapsed && "justify-center",
            !collapsed && "flex-1",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck size={16} className="text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight">
              RBAC System
            </span>
          )}
        </Link>

        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed ? "h-5 w-5" : "ml-auto h-6 w-6",
          )}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-x-hidden overflow-y-auto py-4">
        {/* Main nav */}
        <div className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-2")}>
          {mainNav.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-lg text-sm transition-colors",
                  collapsed ? "justify-center px-0" : "px-3",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}
        </div>

        {/* Settings section */}
        <div className="mt-6">
          {!collapsed ? (
            <p className="mb-1.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {dict.settings.heading}
            </p>
          ) : (
            <div className="mx-auto mb-1.5 h-px w-8 bg-sidebar-border" />
          )}
          <div className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-2")}>
            {settingsNav.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex h-9 items-center gap-3 rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center px-0" : "px-3",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border",
          collapsed ? "p-1.5" : "p-3",
        )}
      >
        <Link
          href="/profile"
          title={collapsed ? userName : undefined}
          className={cn(
            "mb-2 flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-sidebar-accent",
            collapsed && "justify-center",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              pathname === "/profile"
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            {initial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">
                {userName}
              </p>
              <p className="truncate text-xs capitalize leading-tight text-muted-foreground">
                {userRole}
              </p>
            </div>
          )}
        </Link>

        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <LogoutButton compact />
          </div>
        ) : (
          <div className="flex items-center gap-1 px-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="flex-1" />
            <LogoutButton />
          </div>
        )}
      </div>
    </aside>
  );
}
