"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
}

export function ProfileButton({ name }: Props) {
  const pathname = usePathname();
  const isActive = pathname === "/profile";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href="/profile"
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {initial}
    </Link>
  );
}
