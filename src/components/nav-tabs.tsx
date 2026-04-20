"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/locale-context";

export function NavTabs() {
  const pathname = usePathname();
  const { dict } = useLocale();

  const tabs = [
    { label: dict.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: dict.nav.settings, href: "/settings/permissions", icon: Settings },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-0">
        {tabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith("/settings");

          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-10 text-sm rounded-none border-b-2 bg-transparent hover:bg-transparent transition-colors",
                  isActive
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon size={15} />
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
