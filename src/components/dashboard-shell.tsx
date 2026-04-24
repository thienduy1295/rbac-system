"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";

interface DashboardShellProps {
  userName: string;
  userRole: string;
  canSeeGroups: boolean;
  canSeeUsers: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  userName,
  userRole,
  canSeeGroups,
  canSeeUsers,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setCollapsed(saved === "true");
  }, []);

  const toggle = () =>
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        userName={userName}
        userRole={userRole}
        canSeeGroups={canSeeGroups}
        canSeeUsers={canSeeUsers}
        collapsed={collapsed}
        onToggle={toggle}
      />
      <main
        className={cn(
          "min-h-screen flex-1 transition-[padding-left] duration-200 ease-in-out",
          collapsed ? "pl-14" : "pl-60",
        )}
      >
        <div className="px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
