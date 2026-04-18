"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKey, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const allTabs = [
  {
    label: "Permissions",
    href: "/settings/permissions",
    icon: ShieldCheck,
    key: "permissions",
  },
  { label: "Groups", href: "/settings/groups", icon: FolderKey, key: "groups" },
  { label: "Users", href: "/settings/users", icon: Users, key: "users" },
];

interface Props {
  canSeeGroups: boolean;
  canSeeUsers: boolean;
}

export function SettingsTabs({ canSeeGroups, canSeeUsers }: Props) {
  const pathname = usePathname();

  const visibleTabs = allTabs.filter((tab) => {
    if (tab.key === "groups") return canSeeGroups;
    if (tab.key === "users") return canSeeUsers;
    return true; // permissions tab luôn hiện
  });

  return (
    <nav className="flex flex-col gap-1">
      {visibleTabs.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
              isActive
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
