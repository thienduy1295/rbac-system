"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKey, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";

interface Props {
  canSeeGroups: boolean;
  canSeeUsers: boolean;
}

export function SettingsTabs({ canSeeGroups, canSeeUsers }: Props) {
  const pathname = usePathname();
  const { dict } = useLocale();

  const allTabs = [
    {
      label: dict.settings.tabs.permissions,
      href: "/settings/permissions",
      icon: ShieldCheck,
      key: "permissions",
    },
    {
      label: dict.settings.tabs.groups,
      href: "/settings/groups",
      icon: FolderKey,
      key: "groups",
    },
    {
      label: dict.settings.tabs.users,
      href: "/settings/users",
      icon: Users,
      key: "users",
    },
  ];

  const visibleTabs = allTabs.filter((tab) => {
    if (tab.key === "groups") return canSeeGroups;
    if (tab.key === "users") return canSeeUsers;
    return true;
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
